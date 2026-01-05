import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, TripStatus } from "@prisma/client";

import { requireORSAuth } from "@/lib/ors-auth-middleware";
import { sendDriverTripCanceled } from "@/lib/SmsService/DriverSMSSender";

// Route configuration - ensure this route is completely public
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

// POST /api/partner/trip/cancel
export async function POST(req: NextRequest) {
  const authResult = requireORSAuth(req);

  if (authResult) return authResult;

  const body = await req.json();
  const { ticketcode } = body;

  if (!ticketcode || typeof ticketcode !== "string" || !ticketcode.trim()) {
    return NextResponse.json(
      { error: "Invalid or missing ticketcode" },
      { status: 400 },
    );
  }

  // Fetch trip with driver by SecureToken (ticketcode)
  const trip = await prisma.trip.findUnique({
    where: { TicketCode: ticketcode },
    include: { Driver: true },
  });

  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  // Set status to canceled
  await prisma.trip.update({
    where: { id: trip.id },
    data: { status: TripStatus.canceled },
  });

  // If trip has a driver, send SMS
  if (trip.Driver && trip.Driver.PhoneNumber) {
    await sendDriverTripCanceled(trip.Driver.PhoneNumber, trip);
  }

  return NextResponse.json({ success: true });
}
