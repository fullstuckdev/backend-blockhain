import { Prisma } from '@prisma/client';

export interface PriceAlert {
  chain: string;
  targetPrice: number;
  email: string;
}

export type TokenPrice = {
  id: string;
  timestamp: Date;
  eth_price: Prisma.Decimal;
  matic_price: Prisma.Decimal;
};

export interface HourlyPrice {
  timestamp: Date;
  ethPrice: number;
  maticPrice: number;
  count: number;
}

export type SwapRate = {
  btcAmount: number;
  fee: {
    eth: number;
    usd: number;
  };
};

export interface HourlyPriceData {
  timestamp: string;
  ethPrice: number;
  maticPrice: number;
  count: number;
}

export interface SwapRateResponse {
  btcAmount: number;
  fee: {
    eth: number;
    usd: number;
  };
}

export interface AlertPricingResponse {
  code: number;
  description: string;
}
