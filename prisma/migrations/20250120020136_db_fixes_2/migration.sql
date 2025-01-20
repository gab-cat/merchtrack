/*
  Warnings:

  - You are about to drop the column `question1` on the `CustomerSatisfactionSurvey` table. All the data in the column will be lost.
  - You are about to drop the column `question2` on the `CustomerSatisfactionSurvey` table. All the data in the column will be lost.
  - You are about to drop the column `question3` on the `CustomerSatisfactionSurvey` table. All the data in the column will be lost.
  - You are about to drop the column `question4` on the `CustomerSatisfactionSurvey` table. All the data in the column will be lost.
  - You are about to drop the column `customerSatisfactionSurveyid` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `fulfillmentid` on the `Order` table. All the data in the column will be lost.
  - You are about to alter the column `question1` on the `SurveyCategory` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - You are about to alter the column `question2` on the `SurveyCategory` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - You are about to alter the column `question3` on the `SurveyCategory` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - You are about to alter the column `question4` on the `SurveyCategory` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - Added the required column `answers` to the `CustomerSatisfactionSurvey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Permission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentStatus" ADD VALUE 'PROCESSING';
ALTER TYPE "PaymentStatus" ADD VALUE 'FAILED';
ALTER TYPE "PaymentStatus" ADD VALUE 'REFUND_PENDING';
ALTER TYPE "PaymentStatus" ADD VALUE 'REFUNDED';
ALTER TYPE "PaymentStatus" ADD VALUE 'CANCELLED';

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_customerSatisfactionSurveyid_fkey";

-- DropForeignKey
ALTER TABLE "UserPermission" DROP CONSTRAINT "UserPermission_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "UserPermission" DROP CONSTRAINT "UserPermission_userId_fkey";

-- DropIndex
DROP INDEX "Fulfillment_orderId_key";

-- AlterTable
ALTER TABLE "CustomerSatisfactionSurvey" DROP COLUMN "question1",
DROP COLUMN "question2",
DROP COLUMN "question3",
DROP COLUMN "question4",
ADD COLUMN     "answers" JSONB NOT NULL,
ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "customerSatisfactionSurveyid",
DROP COLUMN "fulfillmentid",
ADD COLUMN     "customerSatisfactionSurveyId" TEXT,
ADD COLUMN     "fulfillmentId" TEXT,
ALTER COLUMN "cancellationReason" DROP NOT NULL,
ALTER COLUMN "cancellationReason" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'PHP',
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "paymentProvider" TEXT,
ADD COLUMN     "transactionId" TEXT;

-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SurveyCategory" ALTER COLUMN "question1" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "question2" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "question3" SET DATA TYPE VARCHAR(200),
ALTER COLUMN "question4" SET DATA TYPE VARCHAR(200);

-- CreateIndex
CREATE INDEX "idx_fulfillment_status" ON "Fulfillment"("status");

-- CreateIndex
CREATE INDEX "idx_fulfillment_date" ON "Fulfillment"("fulfillmentDate");

-- CreateIndex
CREATE INDEX "idx_fulfillment_orderId" ON "Fulfillment"("orderId");

-- CreateIndex
CREATE INDEX "idx_permission_code" ON "Permission"("code");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerSatisfactionSurveyId_fkey" FOREIGN KEY ("customerSatisfactionSurveyId") REFERENCES "CustomerSatisfactionSurvey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "idx_survey-category_isDeleted" RENAME TO "idx_surveycategory_isDeleted";
