import { PrismaClient } from "@prisma/client";
import React from "react";

import TripPage from "./components/trippage";

const prisma = new PrismaClient();

// This must be a server component to fetch from the DB
export default async function DriverTripPage({
  params,
}: {
  params: { id: string };
}) {
  const trip = await prisma.trip.findUnique({
    where: { SecureToken: params.id },
    include: { Driver: true, Passenger: true, Location: true },
  });

  if (!trip) {
    return <div>سفر پیدا نشد.</div>;
  }

  return (
    <>
      <TripPage trip={trip} />
      <div className="mt-16" />
    </>
  );
}
