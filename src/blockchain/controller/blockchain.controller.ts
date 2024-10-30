import { Body, Controller, Get, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BlockchainService } from '../service/blockchain.service';
import { swapRateDto } from '../model/blockchain.dto';

@ApiTags('Blockchain Api')
@Controller('/api/v1/blockchain')
export class BlockchainController {
  constructor(private readonly service: BlockchainService) {}

  @Get('/testing')
  async testingData(): Promise<any> {
    return await this.service.testingDb();
  }

  @Get('/eth')
  async eth(): Promise<any> {
    return await this.service.getEth();
  }

  @Get('/get-hourly')
  async getHour(): Promise<any> {
    return await this.service.getHourlyPrices();
  }

  @Get('/swap-rate')
  async swapRate(@Body() data: swapRateDto): Promise<any> {
    return await this.service.swapRate(data.number);
  }
}
