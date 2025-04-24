-- CreateTable
CREATE TABLE "Passenger" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "naCode" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ticketCode" TEXT NOT NULL,
    "tripCode" TEXT NOT NULL,
    "originCity" TEXT NOT NULL,
    "destinationCity" TEXT NOT NULL,
    "originID" INTEGER NOT NULL,
    "originName" TEXT NOT NULL,
    "destName" TEXT NOT NULL,
    "carName" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "startsAt" DATETIME NOT NULL,
    "originAttitude" REAL NOT NULL,
    "originLatitude" REAL NOT NULL,
    "passengerId" INTEGER NOT NULL,
    CONSTRAINT "Trip_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "Passenger" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
