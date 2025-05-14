-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Location" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "Title" TEXT NOT NULL,
    "Latitude" REAL,
    "Longitude" REAL,
    "Description" TEXT,
    "TextAddress" TEXT,
    "PhoneNumber" TEXT,
    "passengerId" INTEGER NOT NULL,
    CONSTRAINT "Location_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "Passenger" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Location" ("Description", "Latitude", "Longitude", "Title", "id", "passengerId") SELECT "Description", "Latitude", "Longitude", "Title", "id", "passengerId" FROM "Location";
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
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
