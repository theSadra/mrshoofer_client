/*
  Warnings:

  - You are about to drop the column `Title` on the `Location` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Location" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Latitude" REAL,
    "Longitude" REAL,
    "Description" TEXT,
    "TextAddress" TEXT,
    "PhoneNumber" TEXT,
    "passengerId" INTEGER NOT NULL,
    CONSTRAINT "Location_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "Passenger" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Location" ("Description", "Latitude", "Longitude", "PhoneNumber", "TextAddress", "id", "passengerId") SELECT "Description", "Latitude", "Longitude", "PhoneNumber", "TextAddress", "id", "passengerId" FROM "Location";
DROP TABLE "Location";
ALTER TABLE "new_Location" RENAME TO "Location";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
