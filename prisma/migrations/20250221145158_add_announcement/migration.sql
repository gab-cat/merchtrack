-- CreateEnum
CREATE TYPE "AnnouncementLevel" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AnnouncementType" AS ENUM ('NORMAL', 'SYSTEM');

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "inventory" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "AnnouncementType" NOT NULL DEFAULT 'NORMAL',
    "level" "AnnouncementLevel" NOT NULL DEFAULT 'INFO',
    "publishedById" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_publishedById_fkey" FOREIGN KEY ("publishedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
