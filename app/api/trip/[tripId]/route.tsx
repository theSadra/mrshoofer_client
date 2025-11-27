import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/trip/[tripId] - Get trip information by SecureToken
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> },
) {
  try {
    const { tripId } = await params;

    const trip = await prisma.trip.findUnique({
      where: { SecureToken: tripId },
      include: {
        Passenger: true,
        OriginLocation: true,
        DestinationLocation: true,
        Driver: true,
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const normalizedTrip = {
      ...trip,
      Location: trip.OriginLocation ?? trip.DestinationLocation ?? null,
    };

    return NextResponse.json(normalizedTrip);
  } catch (error) {
    console.error("Error fetching trip:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
