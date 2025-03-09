-- CreateEnum
CREATE TYPE "PaymentPreference" AS ENUM ('FULL', 'DOWNPAYMENT');

-- AlterTable
ALTER TABLE "Order" 
ADD COLUMN "customerNotes" TEXT,
ADD COLUMN "paymentPreference" "PaymentPreference" DEFAULT 'FULL';
