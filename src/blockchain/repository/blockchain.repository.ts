export abstract class BlockchainRepository {
  abstract testingDb(): Promise<any>;
  abstract getEth(): Promise<any>;
  abstract getHourlyPrices(): Promise<any>;
}
