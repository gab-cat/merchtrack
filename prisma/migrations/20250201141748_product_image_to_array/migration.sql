/*
  Warnings:

  - You are about to drop the column `imageUrlDark` on the `Product` table. All the data in the column will be lost.
  - The `imageUrl` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "imageUrlDark",
DROP COLUMN "imageUrl",
ADD COLUMN     "imageUrl" TEXT[];
