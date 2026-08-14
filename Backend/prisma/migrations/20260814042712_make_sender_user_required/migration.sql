/*
  Warnings:

  - Made the column `userId` on table `Sender` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Sender" DROP CONSTRAINT "Sender_userId_fkey";

-- AlterTable
ALTER TABLE "Sender" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Sender_userId_idx" ON "Sender"("userId");

-- AddForeignKey
ALTER TABLE "Sender" ADD CONSTRAINT "Sender_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
