-- CreateEnum
CREATE TYPE "ReferralStatus" AS ENUM ('PENDING', 'APPROVED', 'REVERSED');

-- CreateEnum
CREATE TYPE "RedeemStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "collaborators" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "commissionRate" DOUBLE PRECISION NOT NULL DEFAULT 10,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "handle" TEXT,
ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userId" TEXT;

-- CreateTable
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "collaboratorId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderAmount" DOUBLE PRECISION NOT NULL,
    "commission" DOUBLE PRECISION NOT NULL,
    "status" "ReferralStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "redeem_requests" (
    "id" TEXT NOT NULL,
    "collaboratorId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "RedeemStatus" NOT NULL DEFAULT 'REQUESTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "redeem_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "referrals_orderId_key" ON "referrals"("orderId");

-- CreateIndex
CREATE INDEX "referrals_collaboratorId_idx" ON "referrals"("collaboratorId");

-- CreateIndex
CREATE INDEX "redeem_requests_collaboratorId_idx" ON "redeem_requests"("collaboratorId");

-- CreateIndex
CREATE UNIQUE INDEX "collaborators_userId_key" ON "collaborators"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "collaborators_referralCode_key" ON "collaborators"("referralCode");

-- AddForeignKey
ALTER TABLE "collaborators" ADD CONSTRAINT "collaborators_userId_fkey" FOREIGN KEY ("userId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "collaborators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redeem_requests" ADD CONSTRAINT "redeem_requests_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "collaborators"("id") ON DELETE CASCADE ON UPDATE CASCADE;
