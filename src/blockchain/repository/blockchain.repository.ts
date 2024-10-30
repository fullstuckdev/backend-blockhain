export abstract class BlockchainRepository {
  abstract testingDb(): Promise<any>;
}
