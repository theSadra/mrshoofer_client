import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/trip/[tripId] - Get trip information by SecureToken
export async function GET(
  req: NextRequest,
  { params }: { params: { tripId: string } },
) {
  try {
    const tripId = params.tripId;

    const trip = await prisma.trip.findUnique({
      where: { SecureToken: tripId },
      include: {
        Passenger: true,
        Location: true,
        Driver: true,
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    return NextResponse.json(trip);
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
