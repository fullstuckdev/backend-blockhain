import { AlertPricingDto } from '../model/blockchain.dto';
import { AlertPricingResponse, HourlyPriceData, SwapRateResponse } from '../types/priceAlert';

export abstract class BlockchainService {
  abstract getHourlyPrices(): Promise<HourlyPriceData[]>;
  abstract swapRate(number: number): Promise<SwapRateResponse>;
  abstract alertPricing(data: AlertPricingDto): Promise<AlertPricingResponse>;
}
