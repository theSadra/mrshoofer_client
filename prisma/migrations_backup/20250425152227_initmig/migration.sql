-- CreateTable
CREATE TABLE "Passenger" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Firstname" TEXT NOT NULL,
    "Lastname" TEXT NOT NULL,
    "NumberPhone" TEXT NOT NULL,
    "NaCode" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Trip" (
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
    CONSTRAINT "Trip_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "Passenger" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Trip_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Location" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Title" TEXT NOT NULL,
    "Latitude" REAL,
    "Longitude" REAL,
    "Description" TEXT NOT NULL,
    "passengerId" INTEGER NOT NULL,
    CONSTRAINT "Location_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "Passenger" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
