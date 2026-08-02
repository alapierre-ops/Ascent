-- Guest accounts: nullable email, isGuest flag, lastActiveAt for purge cron.
-- Also drops legacy email/password auth columns removed from the schema.

ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isGuest" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "User" DROP COLUMN IF EXISTS "password";
ALTER TABLE "User" DROP COLUMN IF EXISTS "resetToken";
ALTER TABLE "User" DROP COLUMN IF EXISTS "resetTokenExpiry";
ALTER TABLE "User" DROP COLUMN IF EXISTS "emailVerified";
ALTER TABLE "User" DROP COLUMN IF EXISTS "verificationToken";

CREATE INDEX IF NOT EXISTS "User_isGuest_lastActiveAt_idx" ON "User"("isGuest", "lastActiveAt");
