-- GST invoices: each product's HSN code and rate, snapshotted onto order
-- lines, plus the invoice number and seller details on each order.

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "gstRateBps" INTEGER NOT NULL DEFAULT 1800,
ADD COLUMN     "hsnCode" TEXT NOT NULL DEFAULT '3304';

-- AlterTable
-- Lines bought before this change were all make-up and skin care at 18%,
-- so they're filled in with that, then the columns become required.
ALTER TABLE "order_items" ADD COLUMN     "gstRateBps" INTEGER NOT NULL DEFAULT 1800,
ADD COLUMN     "hsnCode" TEXT NOT NULL DEFAULT '3304';
ALTER TABLE "order_items" ALTER COLUMN "gstRateBps" DROP DEFAULT,
ALTER COLUMN "hsnCode" DROP DEFAULT;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "invoiceNumber" TEXT,
ADD COLUMN     "invoiceSeller" JSONB,
ADD COLUMN     "invoicedAt" TIMESTAMP(3);

-- DropTable
-- Sample rows from the seed; nothing read them.
DROP TABLE "tax_rates";

-- CreateTable
CREATE TABLE "invoice_sequences" (
    "financialYear" TEXT NOT NULL,
    "lastNumber" INTEGER NOT NULL,

    CONSTRAINT "invoice_sequences_pkey" PRIMARY KEY ("financialYear")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_invoiceNumber_key" ON "orders"("invoiceNumber");
