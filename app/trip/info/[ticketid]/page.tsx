import React from "react";
import TripInfo from "../components/tripinfo";
import { Prisma, PrismaClient, TripStatus } from "@prisma/client";

async function Upcoming({ params }: { params: { ticketid: string } }) {
  const prisma = new PrismaClient();

  try {
    const trip = await prisma.trip.findUnique({
      where: { SecureToken: params.ticketid },
      include: { Passenger: true, Location: true },
    });

    return (
      <div>
        <TripInfo trip={trip} />
      </div>
    );
  } finally {
    await prisma.$disconnect();
  }
}

export default Upcoming;
