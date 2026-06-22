-- AlterTable
ALTER TABLE "Mission" ADD COLUMN "repeatKey" TEXT;

-- CreateIndex
CREATE INDEX "Mission_userId_repeatKey_idx" ON "Mission"("userId", "repeatKey");
