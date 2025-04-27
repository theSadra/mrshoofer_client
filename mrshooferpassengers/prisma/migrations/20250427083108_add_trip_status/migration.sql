-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    CONSTRAINT "Trip_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "Passenger" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Trip_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Trip" ("AdminApproved", "CarName", "DestinationCity", "Destination_id", "OriginCity", "Origin_id", "PassengerSmsSent", "ServiceName", "StartsAt", "TicketCode", "TripCode", "id", "locationId", "passengerId") SELECT "AdminApproved", "CarName", "DestinationCity", "Destination_id", "OriginCity", "Origin_id", "PassengerSmsSent", "ServiceName", "StartsAt", "TicketCode", "TripCode", "id", "locationId", "passengerId" FROM "Trip";
DROP TABLE "Trip";
ALTER TABLE "new_Trip" RENAME TO "Trip";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
