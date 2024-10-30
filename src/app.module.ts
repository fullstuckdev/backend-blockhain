import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlockchainModule } from './blockchain/blockchain.module';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [ScheduleModule.forRoot(), ConfigModule.forRoot(), BlockchainModule],
})
export class AppModule {}
