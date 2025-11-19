-- Add new origin/destination location columns if they are missing
ALTER TABLE "Trip" ADD COLUMN IF NOT EXISTS "originLocationId" INTEGER;
ALTER TABLE "Trip" ADD COLUMN IF NOT EXISTS "destinationLocationId" INTEGER;

-- Backfill the new columns from the legacy locationId so existing data keeps working
UPDATE "Trip"
SET "originLocationId" = COALESCE("originLocationId", "locationId")
WHERE "originLocationId" IS NULL AND "locationId" IS NOT NULL;

-- Only populate destination when it is completely empty and we have a legacy location
UPDATE "Trip"
SET "destinationLocationId" = COALESCE("destinationLocationId", "locationId")
WHERE "destinationLocationId" IS NULL AND "locationId" IS NOT NULL;

-- Add the new foreign keys when they do not exist yet
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.constraint_column_usage
        WHERE table_name = 'Trip'
          AND constraint_name = 'Trip_originLocationId_fkey'
    ) THEN
        ALTER TABLE "Trip"
        ADD CONSTRAINT "Trip_originLocationId_fkey"
        FOREIGN KEY ("originLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.constraint_column_usage
        WHERE table_name = 'Trip'
          AND constraint_name = 'Trip_destinationLocationId_fkey'
    ) THEN
        ALTER TABLE "Trip"
        ADD CONSTRAINT "Trip_destinationLocationId_fkey"
        FOREIGN KEY ("destinationLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
