-- DropForeignKey
ALTER TABLE "Sender" DROP CONSTRAINT "Sender_userId_fkey";

-- DropIndex
DROP INDEX "Sender_userId_idx";

-- AlterTable
ALTER TABLE "Sender" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Sender" ADD CONSTRAINT "Sender_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
