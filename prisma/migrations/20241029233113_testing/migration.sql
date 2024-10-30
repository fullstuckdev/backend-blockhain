-- CreateTable
CREATE TABLE "Testing" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,

    CONSTRAINT "Testing_pkey" PRIMARY KEY ("id")
);
