-- Manual patch for Postgres
-- Adds isSuperAdmin column to the User table if it does not exist

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'User'
      AND column_name = 'isSuperAdmin'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;
