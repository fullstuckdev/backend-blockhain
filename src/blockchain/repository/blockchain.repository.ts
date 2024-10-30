import {
  AlertPricingResponse,
  HourlyPriceData,
  SwapRateResponse,
} from '../types/priceAlert';
export abstract class BlockchainRepository {
  abstract getHourlyPrices(): Promise<HourlyPriceData[]>;
  abstract getSwapRate(number: number): Promise<SwapRateResponse>;
  abstract setPriceAlert(
    chain: string,
    targetPrice: number,
    email: string,
  ): Promise<void>;
}
