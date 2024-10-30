-- CreateTable
CREATE TABLE "token_prices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "timestamp" TIMESTAMP(6) NOT NULL,
    "eth_price" DECIMAL(65,30) NOT NULL,
    "matic_price" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "token_prices_pkey" PRIMARY KEY ("id")
);
