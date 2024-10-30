export abstract class BlockchainService {
  abstract testingDb(): Promise<any>;
  abstract getEth(): Promise<any>;
  abstract getHourlyPrices(): Promise<any>;
  abstract swapRate(number: number): Promise<any>;
}
