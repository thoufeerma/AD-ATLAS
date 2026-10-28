-- AlterTable
ALTER TABLE "redeem_requests" DROP COLUMN "amount",
ADD COLUMN     "amountPaise" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "referrals" DROP COLUMN "commission",
DROP COLUMN "orderAmount",
ADD COLUMN     "commissionPaise" INTEGER NOT NULL,
ADD COLUMN     "orderAmountPaise" INTEGER NOT NULL;
