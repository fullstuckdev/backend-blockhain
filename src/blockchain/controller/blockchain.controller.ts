import { Controller, Get, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BlockchainService } from '../service/blockchain.service';

@ApiTags('Blockchain Api')
@Controller('/api/v1/blockchain')
export class BlockchainController {
  constructor(private readonly service: BlockchainService) {}

  @Get('/testing')
  async testingData(): Promise<any> {
    return await this.service.testingDb();
  }
}