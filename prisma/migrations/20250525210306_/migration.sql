/*
  Warnings:

  - A unique constraint covering the columns `[NumberPhone]` on the table `Passenger` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Passenger_NumberPhone_key" ON "Passenger"("NumberPhone");
