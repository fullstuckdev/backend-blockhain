import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsString } from 'class-validator';

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
    example: 'ethereum',
    enum: ['ethereum', 'matic'],
  })
  chain: string;

  @ApiProperty({
    description: 'Target price in USD that will trigger the alert',
    example: 1000,
    minimum: 0,
  })
  dollar: number;

  @ApiProperty({
    description: 'Email address to receive the alert',
    example: 'user@example.com',
    format: 'email',
  })
  email: string;
}
