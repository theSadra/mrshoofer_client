"use server";
import { PrismaClient, TripStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { sendDriverLocationAdded } from "@/lib/SmsService/DriverSMSSender";

const prisma = new PrismaClient();

export async function UpdateLocation(formData: FormData) {
  const tripId = parseInt(formData.get("tripId")?.toString() ?? "0", 10);
  const lat = parseFloat(formData.get("lat")?.toString() ?? "0");
  const lng = parseFloat(formData.get("lng")?.toString() ?? "0");
  const address = formData.get("address")?.toString() || null;
  const description = formData.get("description")?.toString() || null;
  const phoneNumber = formData.get("numberPhone")?.toString() || null;

  // Include Driver in the trip fetch
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { Location: true, Driver: true },
  });

  if (!trip) {
    console.error("Trip not found");
    return;
  }

  if (trip.Location) {
    // Update existing location
    await prisma.location.update({
      where: { id: trip.Location.id },
      data: {
        Latitude: lat,
        Longitude: lng,
        TextAddress: address,
        Description: description,
        PhoneNumber: phoneNumber,
      },
    });
  } else {
    // Create new location
    const newLoc = await prisma.location.create({
      data: {
        Latitude: lat,
        Longitude: lng,
        TextAddress: address,
        Description: description,
        PhoneNumber: phoneNumber,
        passengerId: trip.passengerId, // from Trip
      },
    });
    // Link new location to trip
    await prisma.trip.update({
      where: { id: tripId },
      data: {
        locationId: newLoc.id,
      },
    });
  }

  // If trip has a driver, send SMS
  if (trip.Driver && trip.Driver.PhoneNumber) {
    await sendDriverLocationAdded(trip.Driver.PhoneNumber, trip);
  }

  if (trip.status === TripStatus.wating_info) {
    await prisma.trip.update({
      where: { id: tripId },
      data: {
        status: TripStatus.wating_start,
      },
    });
  }
  revalidatePath("/trip/info");
}
