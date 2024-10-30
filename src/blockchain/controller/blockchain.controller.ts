import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { BlockchainService } from '../service/blockchain.service';
import { AlertPricingDto, SwapRateDto } from '../model/blockchain.dto';
import {
  AlertPricingResponse,
  HourlyPriceData,
  SwapRateResponse,
  ChainType,
} from '../types/priceAlert';

@ApiTags('Blockchain Api')
@Controller('/api/v1/blockchain')
export class BlockchainController {
  constructor(private readonly service: BlockchainService) {}

  @Get('/get-hourly')
  @ApiOperation({ summary: 'Get hourly price data' })
  @ApiResponse({
    status: 200,
    description: 'Returns an array of hourly price data',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'ISO timestamp for the hour',
            example: '2024-10-30T18:00:00.000Z',
          },
          ethPrice: {
            type: 'number',
            description: 'Ethereum price value for that hour',
            example: 2677.66,
          },
          maticPrice: {
            type: 'number',
            description: 'Matic price value for that hour',
            example: 0.33,
          },
          count: {
            type: 'number',
            description: 'Number of records in this hour',
            example: 14,
          },
        },
      },
    },
  })
  async getHour(): Promise<HourlyPriceData[]> {
    return await this.service.getHourlyPrices();
  }

  @Get('/swap-rate')
  @ApiOperation({ summary: 'Get swap rate information' })
  @ApiResponse({
    status: 200,
    description: 'Returns swap rate details including BTC amount and fees',
    schema: {
      type: 'object',
      properties: {
        btcAmount: {
          type: 'number',
          description: 'Amount in BTC',
          example: 3.72235297100205,
        },
        fee: {
          type: 'object',
          properties: {
            eth: {
              type: 'number',
              description: 'Fee in ETH',
              example: 3,
            },
            usd: {
              type: 'number',
              description: 'Fee in USD',
              example: 8031.29,
            },
          },
        },
      },
    },
  })
  async swapRate(@Query('number') number: number): Promise<SwapRateResponse> {
    return await this.service.swapRate(number);
  }

  @Post('/alert-pricing')
  @ApiOperation({
    summary: 'Setup price alert for cryptocurrency',
    description:
      'Sets up an email alert that triggers when a specified cryptocurrency reaches a target price. For example, get notified when Ethereum reaches $1000.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns confirmation of alert pricing setup',
    schema: {
      type: 'object',
      properties: {
        code: {
          type: 'number',
          description: 'Response status code',
          example: 200,
        },
        description: {
          type: 'string',
          description: 'Success message with email',
          example: 'Successfully setup the alert pricing for user@example.com',
        },
      },
    },
  })
  @ApiBody({
    description: 'Alert pricing configuration',
    type: AlertPricingDto,
    examples: {
      ethereum_alert: {
        summary: 'Ethereum Price Alert',
        value: {
          chain: ChainType.ETH,
          dollar: 1000,
          email: 'user@example.com',
        },
      },
      matic_alert: {
        summary: 'Matic Price Alert',
        value: {
          chain: ChainType.MATIC,
          dollar: 1000,
          email: 'user@example.com',
        },
      },
    },
  })
  async alertPricing(
    @Body()
    data: AlertPricingDto,
  ): Promise<AlertPricingResponse> {
    return await this.service.alertPricing(data);
  }
}
