-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "repliesToId" TEXT;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_repliesToId_fkey" FOREIGN KEY ("repliesToId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
