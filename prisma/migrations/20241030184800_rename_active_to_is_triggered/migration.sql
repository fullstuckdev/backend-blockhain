/*
  Warnings:

  - You are about to drop the `alert_emails` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "alert_emails";

-- CreateTable
CREATE TABLE "price_alerts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "chain" TEXT NOT NULL,
    "target_pricing" DECIMAL(65,30) NOT NULL,
    "email" TEXT NOT NULL,
    "isTriggered" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "price_alerts_pkey" PRIMARY KEY ("id")
);
