import { Injectable } from '@nestjs/common';
import { Postgres } from '../../config/database/postgres';
import { BlockchainRepository } from './blockchain.repository';
import Moralis from 'moralis';
import { initializeMoralis } from 'src/config/moralis/moralis';
import * as nodemailer from 'nodemailer';
import { Cron } from '@nestjs/schedule';
import {
  HourlyPrice,
  HourlyPriceData,
  SwapRate,
  SwapRateResponse,
} from '../types/priceAlert';
import { groupPricesByHour } from '../utils/blockchain.utils';
import { BlockchainPriceMonitor } from '../utils/blockchain.utils';

@Injectable()
export class BlockchainRepositoryImpl implements BlockchainRepository {
  private static isMoralisInitialized = false;
  private transporter: nodemailer.Transporter;
  private priceMonitor: BlockchainPriceMonitor;

  constructor(private readonly prisma: Postgres) {
    this.initializeEmailTransporter();
    this.priceMonitor = new BlockchainPriceMonitor(
      this.prisma,
      this.transporter,
    );
  }

  private async initializeMoralis(): Promise<void> {
    if (!BlockchainRepositoryImpl.isMoralisInitialized) {
      try {
        await initializeMoralis();
        BlockchainRepositoryImpl.isMoralisInitialized = true;
      } catch (error) {
        console.error('Error initializing Moralis:', error);
        throw error;
      }
    }
  }

  private initializeEmailTransporter() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // 1. Automatically save the Price of Ethereum and Polygon every 5 minutes
  @Cron('*/5 * * * *')
  async savePrices(): Promise<void> {
    await this.initializeMoralis();

    try {
      // Get ETH price
      const ethResponse = await Moralis.EvmApi.token.getTokenPrice({
        address: process.env.ETH_CONTRACT_ADDRESS,
        chain: process.env.CHAIN_MORALIS_ETH,
      });

      // Get POLYGON price
      const maticResponse = await Moralis.EvmApi.token.getTokenPrice({
        address: process.env.POLY_CONTRACT_ADDRESS,
        chain: process.env.CHAIN_MORALIS_POLYGON,
      });

      // Save to database
      await this.prisma.tokenPrice.create({
        data: {
          timestamp: new Date(),
          eth_price: ethResponse.raw.usdPrice,
          matic_price: maticResponse.raw.usdPrice,
        },
      });

      // Check price alerts
      await this.priceMonitor.checkPriceAlerts(
        ethResponse.raw.usdPrice,
        maticResponse.raw.usdPrice,
      );

      // Check hour price change using the price monitor
      await this.priceMonitor.checkHourlyPriceChange();
    } catch (error) {
      console.error('Error saving prices:', error);
    }
  }

  // 2. API - returning the prices of each hour (within 24hours)
  async getHourlyPrices(): Promise<HourlyPriceData[]> {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 3600000);

      const prices = await this.prisma.tokenPrice.findMany({
        where: {
          timestamp: { gte: twentyFourHoursAgo },
        },
        orderBy: { timestamp: 'desc' },
        select: {
          id: true,
          timestamp: true,
          eth_price: true,
          matic_price: true,
        },
      });

      if (prices.length === 0) {
        return [];
      }

      const hourlyPrices = groupPricesByHour(prices);
      return hourlyPrices.map((price) => ({
        ...price,
        timestamp: price.timestamp.toISOString(),
        ethPrice: Number(price.ethPrice.toFixed(8)),
        maticPrice: Number(price.maticPrice.toFixed(8)),
      }));
    } catch (error) {
      console.error('Error fetching hourly prices:', error);
      throw error;
    }
  }

  // 3. API - setting alert for specific price.(parameters are chain, dollar, email)
  async setPriceAlert(
    chain: string,
    targetPrice: number,
    email: string,
  ): Promise<void> {
    // Email validation (using only the regex approach)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Price validations
    const MAX_PRICE = 1000000;
    if (targetPrice <= 0 || targetPrice > MAX_PRICE) {
      throw new Error(`Target price must be between 0 and ${MAX_PRICE}`);
    }

    // Chain validation
    if (!['eth', 'matic'].includes(chain.toLowerCase())) {
      throw new Error('Invalid chain. Must be "eth" or "matic"');
    }

    // Store alert in database
    await this.prisma.priceAlert.create({
      data: {
        chain: chain.toLowerCase(),
        target_pricing: targetPrice,
        email,
        timestamp: new Date(),
        isTriggered: false,
      },
    });
  }

  // 4. API - swap rate calculation (parameters are eth amount)
  async getSwapRate(ethAmount: number): Promise<SwapRateResponse> {
    // Input validation
    if (ethAmount <= 0) {
      throw new Error('ETH amount must be greater than 0');
    }

    await this.initializeMoralis();

    try {
      const [ethPrice, btcPrice] = await Promise.all([
        Moralis.EvmApi.token.getTokenPrice({
          address: process.env.ETH_CONTRACT_ADDRESS,
          chain: process.env.CHAIN_MORALIS_ETH,
        }),
        Moralis.EvmApi.token.getTokenPrice({
          address: process.env.BTC_CONTRACT_ADDRESS,
          chain: process.env.CHAIN_MORALIS_ETH,
        }),
      ]);

      const ethValue = ethAmount * ethPrice.raw.usdPrice;
      const btcAmount = ethValue / btcPrice.raw.usdPrice;

      const feePercentage = 0.03; // 3% fee
      const feeInEth = ethAmount * feePercentage;
      const feeInUsd = feeInEth * ethPrice.raw.usdPrice;

      return {
        btcAmount: Number(btcAmount.toFixed(8)),
        fee: {
          eth: Number(feeInEth.toFixed(18)),
          usd: Number(feeInUsd.toFixed(2)),
        },
      };
    } catch (error) {
      console.error('Error calculating swap rate:', error);
      throw new Error('Failed to calculate swap rate');
    }
  }
}
