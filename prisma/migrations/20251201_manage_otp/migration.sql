-- Add phoneNumber column for admin accounts
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "User_phoneNumber_key" ON "User"("phoneNumber") WHERE "phoneNumber" IS NOT NULL;

-- OTP table for admin logins
CREATE TABLE IF NOT EXISTS "AdminOtp" (
  "phone" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "lastSentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "AdminOtp_expiresAt_idx" ON "AdminOtp"("expiresAt");
