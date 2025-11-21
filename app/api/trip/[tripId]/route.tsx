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
    
    console.log("[API] Fetching trip with SecureToken:", tripId);

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
      console.log("[API] Trip not found for token:", tripId);
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    console.log("[API] Trip found successfully:", { 
      id: trip.id, 
      TicketCode: trip.TicketCode,
      hasOriginLocation: !!trip.OriginLocation,
      hasDestinationLocation: !!trip.DestinationLocation
    });
    
    return NextResponse.json(trip);
  } catch (error) {
    console.error("[API] Error fetching trip:", error);
    console.error("[API] Error details:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
