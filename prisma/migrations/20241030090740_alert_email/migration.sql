-- CreateTable
CREATE TABLE "alert_emails" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "chain" TEXT NOT NULL,
    "target_pricing" DECIMAL(65,30) NOT NULL,
    "email" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "timestamp" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "alert_emails_pkey" PRIMARY KEY ("id")
);
