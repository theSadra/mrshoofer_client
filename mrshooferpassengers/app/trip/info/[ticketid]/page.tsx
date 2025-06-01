import React from "react";
import TripInfo from "../components/tripinfo";
import { Prisma, PrismaClient, TripStatus } from "@prisma/client";
var mocked_trip: Prisma.TripGetPayload<{
  include: { Location: true; Passenger: true };
}>;

async function Upcoming({ params }: { params: { ticketid: string } }) {
  const prisma = new PrismaClient();
  // Mocked trip object

  const trip = await prisma.trip.findUnique({
    where: { SecureToken: params.ticketid },
    include: { Passenger: true, Location: true },
  });

  return (
    <div>
      <TripInfo trip={trip ?? mocked_trip} />
    </div>
  );
}

export default Upcoming;
