-- Step 1: Add userId as nullable temporarily
ALTER TABLE "Sender"
ADD COLUMN "userId" TEXT;

-- Step 2: Assign existing senders to the existing user
UPDATE "Sender"
SET "userId" = '98f198c5-160c-4ec2-b1ba-905104038c6a'
WHERE "userId" IS NULL;

-- Step 3: Make userId required
ALTER TABLE "Sender"
ALTER COLUMN "userId" SET NOT NULL;

-- Step 4: Create index
CREATE INDEX "Sender_userId_idx"
ON "Sender"("userId");

-- Step 5: Add foreign key
ALTER TABLE "Sender"
ADD CONSTRAINT "Sender_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "User"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;