/*
  Warnings:

  - You are about to drop the column `productId` on the `CartItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_productId_fkey";

-- DropIndex
DROP INDEX "idx_cartItem_productId";

-- AlterTable
ALTER TABLE "CartItem" DROP COLUMN "productId";
