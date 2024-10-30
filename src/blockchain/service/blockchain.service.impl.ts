import { Injectable } from '@nestjs/common';
import { BlockchainRepository } from '../repository/blockchain.repository';
import { BlockchainService } from './blockchain.service';

@Injectable()
export class BlockchainServiceImpl implements BlockchainService {
  constructor(private readonly repositoryBlockchain: BlockchainRepository) {}

  async testingDb(): Promise<any> {
    try {
      const dataTesting = await this.repositoryBlockchain.testingDb();
      return dataTesting;
    } catch (error) {
      console.log(error);
    }
  }

  async getEth(): Promise<any> {
    try {
      const dataTesting = await this.repositoryBlockchain.getEth();
      return dataTesting;
    } catch (error) {
      console.log(error);
    }
  }
}
