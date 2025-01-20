-- CreateEnum
CREATE TYPE "PaymentSite" AS ENUM ('ONSITE', 'OFFSITE');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "paymentSite" "PaymentSite" NOT NULL DEFAULT 'ONSITE';
