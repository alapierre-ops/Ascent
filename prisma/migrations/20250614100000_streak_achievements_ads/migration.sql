-- AlterEnum
ALTER TYPE "PendingRewardType" ADD VALUE 'ACHIEVEMENT';

-- AlterTable
ALTER TABLE "User" ADD COLUMN "frozenStreakDates" JSONB NOT NULL DEFAULT '[]';

-- AlterTable
ALTER TABLE "Mission" ADD COLUMN "xpApplied" INTEGER;

-- AlterTable
ALTER TABLE "PendingReward" ADD COLUMN "refAchievementId" TEXT;
ALTER TABLE "PendingReward" ADD COLUMN "refTier" INTEGER;

-- CreateTable
CREATE TABLE "UserAchievement" (
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "currentTier" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("userId","achievementId")
);

-- CreateTable
CREATE TABLE "AdRewardLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "refId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdRewardLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdRewardLog_userId_createdAt_idx" ON "AdRewardLog"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PendingReward_userId_type_refAchievementId_refTier_key" ON "PendingReward"("userId", "type", "refAchievementId", "refTier");

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdRewardLog" ADD CONSTRAINT "AdRewardLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
