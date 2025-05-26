import React from "react";
import TripInfo from "../components/tripinfo";
import { Prisma, PrismaClient, TripStatus } from "@prisma/client";
var mocked_trip: Prisma.TripGetPayload<{
  include: { Location: true; Passenger: true };
}>;

async function Upcoming({ params }: { params: { ticketid: string } }) {
  const prisma = new PrismaClient();
  // Mocked trip object
  mocked_trip = {
    id: 1,
    TicketCode: "ABC123",
    TripCode: "TRIP001",
    Origin_id: 10,
    Destination_id: 20,
    OriginCity: "تهران",
    DestinationCity: "اصفهان",
    CarName: "سمند|پژو",
    ServiceName: "سرویس اکو",
    StartsAt: new Date(),
    passengerId: 5,
    locationId: 2,
    status: TripStatus.wating_info,
    PassengerSmsSent: false,
    AdminApproved: false,

    Passenger: {
      id: 5,
      Firstname: "علی",
      Lastname: "احمدی",
      NumberPhone: "09902063015",
      NaCode: "NA123",
    },
    Location: null,
  };

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
