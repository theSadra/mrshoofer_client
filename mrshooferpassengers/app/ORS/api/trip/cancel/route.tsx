import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, TripStatus } from "@prisma/client";
import { requireORSAuth } from "@/lib/ors-auth-middleware";
import { sendDriverTripCanceled } from "@/lib/SmsService/DriverSMSSender";

const prisma = new PrismaClient();

// POST /ORS/api/trip/cancel
export async function POST(req: NextRequest) {
    const authResult = requireORSAuth(req);
    if (authResult) return authResult;

    const body = await req.json();
    const { tripId } = body;
    if (!tripId) {
        return NextResponse.json({ error: "Missing tripId" }, { status: 400 });
    }

    // Fetch trip with driver
    const trip = await prisma.trip.findUnique({
        where: { id: Number(tripId) },
        include: { Driver: true },
    });
    if (!trip) {
        return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Set status to canceled
    await prisma.trip.update({
        where: { id: Number(tripId) },
        data: { status: TripStatus.canceled },
    });

    // If trip has a driver, send SMS
    if (trip.Driver && trip.Driver.PhoneNumber) {
        await sendDriverTripCanceled(trip.Driver.PhoneNumber, trip);
    }

    return NextResponse.json({ success: true });
}
