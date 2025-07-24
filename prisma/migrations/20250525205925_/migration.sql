/*
  Warnings:

  - You are about to drop the column `Title` on the `Location` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Driver" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Firstname" TEXT NOT NULL,
    "Lastname" TEXT NOT NULL,
    "CarName" TEXT,
    "PhoneNumber" TEXT NOT NULL
);

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
INSERT INTO "new_Location" ("Description", "Latitude", "Longitude", "id", "passengerId") SELECT "Description", "Latitude", "Longitude", "id", "passengerId" FROM "Location";
DROP TABLE "Location";
ALTER TABLE "new_Location" RENAME TO "Location";
CREATE TABLE "new_Passenger" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Firstname" TEXT NOT NULL,
    "Lastname" TEXT NOT NULL,
    "NumberPhone" TEXT NOT NULL,
    "NaCode" TEXT
);
INSERT INTO "new_Passenger" ("Firstname", "Lastname", "NaCode", "NumberPhone", "id") SELECT "Firstname", "Lastname", "NaCode", "NumberPhone", "id" FROM "Passenger";
DROP TABLE "Passenger";
ALTER TABLE "new_Passenger" RENAME TO "Passenger";
CREATE TABLE "new_Trip" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "TicketCode" TEXT NOT NULL,
    "TripCode" TEXT,
    "Origin_id" INTEGER NOT NULL,
    "Destination_id" INTEGER NOT NULL,
    "OriginCity" TEXT NOT NULL,
    "DestinationCity" TEXT NOT NULL,
    "CarName" TEXT NOT NULL,
    "ServiceName" TEXT NOT NULL,
    "StartsAt" DATETIME NOT NULL,
    "passengerId" INTEGER NOT NULL,
    "locationId" INTEGER,
    "PassengerSmsSent" BOOLEAN NOT NULL,
    "AdminApproved" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'wating_info',
    "driverId" INTEGER,
    CONSTRAINT "Trip_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "Passenger" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Trip_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Trip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Trip" ("AdminApproved", "CarName", "DestinationCity", "Destination_id", "OriginCity", "Origin_id", "PassengerSmsSent", "ServiceName", "StartsAt", "TicketCode", "TripCode", "id", "locationId", "passengerId") SELECT "AdminApproved", "CarName", "DestinationCity", "Destination_id", "OriginCity", "Origin_id", "PassengerSmsSent", "ServiceName", "StartsAt", "TicketCode", "TripCode", "id", "locationId", "passengerId" FROM "Trip";
DROP TABLE "Trip";
ALTER TABLE "new_Trip" RENAME TO "Trip";
CREATE UNIQUE INDEX "Trip_TicketCode_key" ON "Trip"("TicketCode");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
