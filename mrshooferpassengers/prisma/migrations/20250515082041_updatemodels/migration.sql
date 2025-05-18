/*
  Warnings:

  - A unique constraint covering the columns `[TicketCode]` on the table `Trip` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Trip_TicketCode_key" ON "Trip"("TicketCode");
