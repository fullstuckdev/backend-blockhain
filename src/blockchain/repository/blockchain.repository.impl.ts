import { Injectable } from '@nestjs/common';
import { Postgres } from '../../config/database/postgres';
import { BlockchainRepository } from './blockchain.repository';
import Moralis from 'moralis';
import { initializeMoralis } from 'src/config/moralis/moralis';
import * as nodemailer from 'nodemailer';
import { Cron } from '@nestjs/schedule';
interface PriceAlert {
  chain: string;
  targetPrice: number;
  email: string;
}

@Injectable()
export class BlockchainRepositoryImpl implements BlockchainRepository {
  private static isMoralisInitialized = false;
  private priceAlerts: PriceAlert[] = [];
  private transporter: nodemailer.Transporter;

  constructor(private readonly prisma: Postgres) {
    this.initializeEmailTransporter();
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

  // Feature 1: Save prices every 5 minutes
  @Cron('*/5 * * * *')
  async savePrices(): Promise<void> {
    await this.initializeMoralis();

    try {
      // Get ETH price
      const ethResponse = await Moralis.EvmApi.token.getTokenPrice({
        address: process.env.ADDRESS_MORALIS,
        chain: process.env.CHAIN_MORALIS_ETH,
      });

      // Get MATIC price
      const maticResponse = await Moralis.EvmApi.token.getTokenPrice({
        address: process.env.ADDRESS_MORALIS,
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
      await this.checkPriceAlerts(
        ethResponse.raw.usdPrice,
        maticResponse.raw.usdPrice,
      );

      // Check hour price change
      await this.checkHourlyPriceChange();
    } catch (error) {
      console.error('Error saving prices:', error);
    }
  }

  // Feature 2: Check hourly price change and send email if > 3%
  private async checkHourlyPriceChange(): Promise<void> {
    const oneHourAgo = new Date(Date.now() - 3600000);

    const [currentPrices, oldPrices] = await Promise.all([
      this.prisma.tokenPrice.findFirst({
        orderBy: { timestamp: 'desc' },
      }),
      this.prisma.tokenPrice.findFirst({
        where: { timestamp: { lte: oneHourAgo } },
        orderBy: { timestamp: 'desc' },
      }),
    ]);

    if (!currentPrices || !oldPrices) return;

    const ethChange =
      ((Number(currentPrices.eth_price) - Number(oldPrices.eth_price)) /
        Number(oldPrices.eth_price)) *
      100;
    const maticChange =
      ((Number(currentPrices.matic_price) - Number(oldPrices.matic_price)) /
        Number(oldPrices.matic_price)) *
      100;

    if (Math.abs(ethChange) > 3 || Math.abs(maticChange) > 3) {
      await this.sendPriceChangeAlert(ethChange, maticChange);
    }
  }

  private async sendPriceChangeAlert(
    ethChange: number,
    maticChange: number,
  ): Promise<void> {
    const message = {
      from: process.env.SMTP_USER,
      to: 'hyperhire_assignment@hyperhire.in',
      subject: 'Significant Price Change Alert',
      text: `
        Price Change Alert:
        ETH: ${ethChange.toFixed(2)}%
        MATIC: ${maticChange.toFixed(2)}%
      `,
    };

    await this.transporter.sendMail(message);
  }

  // hourly price 24 hours - 3
  async getHourlyPrices(): Promise<any> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 3600000);

    const prices = await this.prisma.tokenPrice.findMany({
      where: {
        timestamp: { gte: twentyFourHoursAgo },
      },
      orderBy: { timestamp: 'desc' },
    });

    const hourlyPrices = this.groupPricesByHour(prices);
    return hourlyPrices;
  }

  private groupPricesByHour(prices: any[]): any[] {
    const hourlyGroups = new Map();

    prices.forEach((price) => {
      const hourKey = new Date(price.timestamp).setMinutes(0, 0, 0);
      if (!hourlyGroups.has(hourKey)) {
        hourlyGroups.set(hourKey, {
          timestamp: new Date(hourKey),
          ethPrice: price.ethPrice,
          maticPrice: price.maticPrice,
          count: 1,
        });
      } else {
        const group = hourlyGroups.get(hourKey);
        group.ethPrice =
          (group.ethPrice * group.count + price.ethPrice) / (group.count + 1);
        group.maticPrice =
          (group.maticPrice * group.count + price.maticPrice) /
          (group.count + 1);
        group.count++;
      }
    });

    return Array.from(hourlyGroups.values());
  }

  // Feature 4: Set price alert
  async setPriceAlert(
    chain: string,
    targetPrice: number,
    email: string,
  ): Promise<void> {
    this.priceAlerts.push({ chain, targetPrice, email });
  }

  private async checkPriceAlerts(
    ethPrice: number,
    maticPrice: number,
  ): Promise<void> {
    for (const alert of this.priceAlerts) {
      const currentPrice =
        alert.chain.toLowerCase() === 'eth' ? ethPrice : maticPrice;

      if (Math.abs(currentPrice - alert.targetPrice) <= 0.01) {
        await this.sendPriceAlert(alert, currentPrice);
        this.priceAlerts = this.priceAlerts.filter((a) => a !== alert);
      }
    }
  }

  private async sendPriceAlert(
    alert: PriceAlert,
    currentPrice: number,
  ): Promise<void> {
    const message = {
      from: process.env.SMTP_USER,
      to: alert.email,
      subject: `Price Alert: ${alert.chain.toUpperCase()} has reached ${alert.targetPrice}`,
      text: `
        Your price alert has been triggered!
        ${alert.chain.toUpperCase()} has reached $${currentPrice}
      `,
    };

    await this.transporter.sendMail(message);
  }

  // swap rate - 5
  async getSwapRate(ethAmount: number): Promise<any> {
    await this.initializeMoralis();

    const [ethPrice, btcPrice] = await Promise.all([
      Moralis.EvmApi.token.getTokenPrice({
        address: process.env.ETH_CONTRACT_ADDRESS,
        chain: process.env.CHAIN_MORALIS,
      }),
      Moralis.EvmApi.token.getTokenPrice({
        address: process.env.BTC_CONTRACT_ADDRESS,
        chain: process.env.CHAIN_MORALIS,
      }),
    ]);

    const ethValue = ethAmount * ethPrice.raw.usdPrice;
    const btcAmount = ethValue / btcPrice.raw.usdPrice;

    const feePercentage = 0.03;
    const feeInEth = ethAmount * feePercentage;
    const feeInUsd = feeInEth * ethPrice.raw.usdPrice;

    return {
      btcAmount,
      fee: {
        eth: feeInEth,
        usd: feeInUsd,
      },
    };
  }

  async getEth(): Promise<any> {
    await this.initializeMoralis();

    // const response = await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
    //   chain: process.env.CHAIN_MORALIS,
    //   address: process.env.ADDRESS_MORALIS,
    // });

    // Get ETH price
    const response = await Moralis.EvmApi.token.getTokenPrice({
      chain: process.env.CHAIN_MORALIS_ETH,
      address: process.env.ETH_CONTRACT_ADDRESS
    });

    // Get MATIC price
    // const maticResponse = await Moralis.EvmApi.token.getTokenPrice({
    //   address: process.env.ADDRESS_MORALIS,
    //   chain: process.env.CHAIN_MORALIS_POLYGON,
    // });

    return response;
  }

  async testingDb(): Promise<any> {
    const data = await this.prisma.testing.findMany();
    return data;
  }
}
