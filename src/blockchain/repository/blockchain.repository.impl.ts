import { Injectable } from '@nestjs/common';
import { Postgres } from 'src/config/database/postgres';
import { BlockchainRepository } from './blockchain.repository';

@Injectable()
export class BlockchainRepositoryImpl implements BlockchainRepository {
  constructor(private readonly prisma: Postgres) {}
  async testingDb():Promise<any> {
    const data = await this.prisma.testing.findMany();
    return data;
  }
}
