-- Credit notes, and one numbering table for every document series.

-- CreateEnum
CREATE TYPE "CreditNoteReason" AS ENUM ('RETURN', 'CANCELLATION', 'REFUND');

-- The invoice counters become the "INV-" series of a general table, keeping
-- the numbers already used (renamed rather than dropped and recreated).
ALTER TABLE "invoice_sequences" RENAME TO "document_sequences";
ALTER TABLE "document_sequences" RENAME COLUMN "financialYear" TO "series";
ALTER TABLE "document_sequences" RENAME CONSTRAINT "invoice_sequences_pkey" TO "document_sequences_pkey";
UPDATE "document_sequences" SET "series" = 'INV-' || "series";

-- CreateTable
CREATE TABLE "credit_notes" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "reason" "CreditNoteReason" NOT NULL,
    "orderId" TEXT NOT NULL,
    "returnId" TEXT,
    "lines" JSONB NOT NULL,
    "taxablePaise" INTEGER NOT NULL,
    "cgstPaise" INTEGER NOT NULL,
    "sgstPaise" INTEGER NOT NULL,
    "igstPaise" INTEGER NOT NULL,
    "totalPaise" INTEGER NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credit_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "credit_notes_number_key" ON "credit_notes"("number");

-- CreateIndex
CREATE UNIQUE INDEX "credit_notes_returnId_key" ON "credit_notes"("returnId");

-- CreateIndex
CREATE INDEX "credit_notes_orderId_idx" ON "credit_notes"("orderId");

-- CreateIndex
CREATE INDEX "credit_notes_issuedAt_idx" ON "credit_notes"("issuedAt");

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credit_notes" ADD CONSTRAINT "credit_notes_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES "return_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;
