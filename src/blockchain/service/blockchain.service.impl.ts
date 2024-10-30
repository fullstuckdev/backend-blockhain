import { Injectable } from '@nestjs/common';
import { BlockchainRepository } from '../repository/blockchain.repository';
import { BlockchainService } from './blockchain.service';
import { AlertPricingDto } from '../model/blockchain.dto';
import {
  AlertPricingResponse,
  HourlyPriceData,
  SwapRateResponse,
} from '../types/priceAlert';

@Injectable()
export class BlockchainServiceImpl implements BlockchainService {
  constructor(private readonly repositoryBlockchain: BlockchainRepository) {}

  async getHourlyPrices(): Promise<HourlyPriceData[]> {
    try {
      const dataTesting = await this.repositoryBlockchain.getHourlyPrices();
      return dataTesting;
    } catch (error) {
      console.log(error);
    }
  }

  async swapRate(number: number): Promise<SwapRateResponse> {
    try {
      const swapRate = await this.repositoryBlockchain.getSwapRate(number);
      return swapRate;
    } catch (error) {
      console.log(error);
    }
  }

  async alertPricing(data: AlertPricingDto): Promise<AlertPricingResponse> {
    try {
      await this.repositoryBlockchain.setPriceAlert(
        data.chain,
        data.dollar,
        data.email,
      );

      return {
        code: 200,
        description: `Successfully setup the alert pricing for ${data.email}`,
      };
    } catch (error) {
      console.log(error);
    }
  }
}
