import { ConfigModule } from '@nestjs/config';
import { BlockchainController } from './controller/blockchain.controller';
import { Postgres } from '../config/database/postgres';
import { Module } from '@nestjs/common';
import { BlockchainService } from './service/blockchain.service';
import { BlockchainServiceImpl } from './service/blockchain.service.impl';
import { BlockchainRepository } from './repository/blockchain.repository';
import { BlockchainRepositoryImpl } from './repository/blockchain.repository.impl';

@Module({
  imports: [ConfigModule],
  providers: [
    Postgres,
    {
      provide: BlockchainService,
      useClass: BlockchainServiceImpl,
    },
    {
      provide: BlockchainRepository,
      useClass: BlockchainRepositoryImpl,
    },
  ],
  controllers: [BlockchainController],
})
export class BlockchainModule {}
