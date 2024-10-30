import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsEnum, Min } from 'class-validator';
import { ChainType } from '../types/priceAlert';

export class SwapRateDto {
  @ApiProperty({
    description: 'Number for swap rate calculation',
    example: 100,
  })
  @IsNumber()
  number: number;
}

export class AlertPricingDto {
  @ApiProperty({
    description: 'The blockchain/cryptocurrency to monitor',
    example: ChainType.ETH,
    enum: ChainType,
  })
  @IsEnum(ChainType, { message: 'Chain must be either "eth" or "matic"' })
  chain: ChainType;

  @ApiProperty({
    description: 'Target price in USD that will trigger the alert',
    example: 1000,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  dollar: number;

  @ApiProperty({
    description: 'Email address to receive the alert',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;
}
