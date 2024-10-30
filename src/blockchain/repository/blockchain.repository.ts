export abstract class BlockchainRepository {
  abstract testingDb(): Promise<any>;
  abstract getEth(): Promise<any>;
  abstract getHourlyPrices(): Promise<any>;
  abstract getSwapRate(number: number): Promise<any>;
}
