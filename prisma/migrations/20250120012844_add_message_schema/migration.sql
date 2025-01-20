-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "isSentByCustomer" BOOLEAN NOT NULL DEFAULT false,
    "isSentByAdmin" BOOLEAN NOT NULL DEFAULT false,
    "sentBy" TEXT,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_message_isArchived" ON "Message"("isArchived");

-- CreateIndex
CREATE INDEX "idx_message_isRead" ON "Message"("isRead");

-- CreateIndex
CREATE INDEX "idx_message_isResolved" ON "Message"("isResolved");

-- CreateIndex
CREATE INDEX "idx_message_initial" ON "Message"("isRead", "isResolved", "isSentByCustomer", "isArchived");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_sentBy_fkey" FOREIGN KEY ("sentBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
