import { Injectable } from '@nestjs/common';
import { Postgres } from '../../config/database/postgres';
import { BlockchainRepository } from './blockchain.repository';
import Moralis from 'moralis';
import { initializeMoralis } from 'src/config/moralis/moralis';

@Injectable()
export class BlockchainRepositoryImpl implements BlockchainRepository {
  private static isMoralisInitialized = false;

  constructor(private readonly prisma: Postgres) {}

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

  async getEth(): Promise<any> {
    await this.initializeMoralis();

    const response = await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice({
      chain: process.env.CHAIN_MORALIS,
      address: process.env.ADDRESS_MORALIS,
    });

    return response;
  }

  async testingDb(): Promise<any> {
    const data = await this.prisma.testing.findMany();
    return data;
  }
}
