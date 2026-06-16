-- CreateEnum
CREATE TYPE "PendingRewardType" AS ENUM ('LEVEL_UP', 'DAILY_QUEST', 'DAILY_LOGIN');

-- CreateTable
CREATE TABLE "PendingReward" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "PendingRewardType" NOT NULL,
    "refLevel" INTEGER,
    "refDate" TEXT,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "claimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingReward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingReward_userId_type_refLevel_key" ON "PendingReward"("userId", "type", "refLevel");

-- CreateIndex
CREATE UNIQUE INDEX "PendingReward_userId_type_refDate_key" ON "PendingReward"("userId", "type", "refDate");

-- AddForeignKey
ALTER TABLE "PendingReward" ADD CONSTRAINT "PendingReward_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "User" DROP COLUMN IF EXISTS "dailyQuestClaimedAt";
