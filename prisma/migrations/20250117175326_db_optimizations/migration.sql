/*
  Warnings:

  - The values [SHIPPED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [CARD,MOBILE_PAYMENT,ONLINE_PAYMENT] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.
  - The `size` column on the `OrderItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `currentPrice` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `originalPrice` on the `Product` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `CustomerSatisfactionSurvey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SurveyCategory` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CancellationReason" AS ENUM ('OUT_OF_STOCK', 'CUSTOMER_REQUEST', 'PAYMENT_FAILED', 'OTHERS');

-- CreateEnum
CREATE TYPE "OrderPaymentStatus" AS ENUM ('PENDING', 'DOWNPAYMENT', 'PAID', 'REFUNDED');

-- CreateEnum
CREATE TYPE "ProductSize" AS ENUM ('XS', 'S', 'M', 'L', 'XL', 'XXL');

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'DELIVERED', 'CANCELLED');
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "OrderStatus_old";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('CASH', 'BANK_TRANSFER', 'GCASH', 'MAYA', 'OTHERS');
ALTER TABLE "Payment" ALTER COLUMN "paymentMethod" DROP DEFAULT;
ALTER TABLE "Payment" ALTER COLUMN "paymentMethod" TYPE "PaymentMethod_new" USING ("paymentMethod"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "PaymentMethod_old";
ALTER TABLE "Payment" ALTER COLUMN "paymentMethod" SET DEFAULT 'CASH';
COMMIT;

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'PLAYER';

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_fulfillmentid_fkey";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "CustomerSatisfactionSurvey" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Fulfillment" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "cancellationReason" "CancellationReason" NOT NULL DEFAULT 'OUT_OF_STOCK',
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentStatus" "OrderPaymentStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "size",
ADD COLUMN     "size" "ProductSize";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "memo" TEXT;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "currentPrice",
DROP COLUMN "originalPrice",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "supposedPrice" JSONB;

-- AlterTable
ALTER TABLE "SurveyCategory" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isOnboarded" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "firstName" DROP DEFAULT,
ALTER COLUMN "lastName" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPermission" (
    "userId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "UserPermission_pkey" PRIMARY KEY ("userId","permissionId")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "variantName" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "rolePricing" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");

-- CreateIndex
CREATE INDEX "idx_variant_product-id" ON "ProductVariant"("productId");

-- CreateIndex
CREATE INDEX "idx_category_name" ON "Category"("name");

-- CreateIndex
CREATE INDEX "idx_survey_categoryId" ON "CustomerSatisfactionSurvey"("categoryId");

-- CreateIndex
CREATE INDEX "idx_fulfillment_processedById" ON "Fulfillment"("processedById");

-- CreateIndex
CREATE INDEX "idx_fulfillment_isDeleted" ON "Fulfillment"("isDeleted");

-- CreateIndex
CREATE INDEX "idx_log_userId" ON "Log"("userId");

-- CreateIndex
CREATE INDEX "idx_log_createdById" ON "Log"("createdById");

-- CreateIndex
CREATE INDEX "idx_order_customerId" ON "Order"("customerId");

-- CreateIndex
CREATE INDEX "idx_order_processedById" ON "Order"("processedById");

-- CreateIndex
CREATE INDEX "idx_order_status" ON "Order"("status");

-- CreateIndex
CREATE INDEX "idx_order_isDeleted" ON "Order"("isDeleted");

-- CreateIndex
CREATE INDEX "idx_orderitem_orderId" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "idx_orderitem_productId" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "idx_payment_orderId" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "idx_payment_userId" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "idx_payment_processedById" ON "Payment"("processedById");

-- CreateIndex
CREATE INDEX "idx_payment_isDeleted" ON "Payment"("isDeleted");

-- CreateIndex
CREATE INDEX "idx_product_slug" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "idx_product_isDeleted" ON "Product"("isDeleted");

-- CreateIndex
CREATE INDEX "idx_surveycategory_name" ON "SurveyCategory"("name");

-- CreateIndex
CREATE INDEX "idx_survey-category_isDeleted" ON "SurveyCategory"("isDeleted");

-- CreateIndex
CREATE INDEX "idx_user_email" ON "User"("email");

-- CreateIndex
CREATE INDEX "idx_user_clerkId" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "idx_user_isDeleted" ON "User"("isDeleted");

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPermission" ADD CONSTRAINT "UserPermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
