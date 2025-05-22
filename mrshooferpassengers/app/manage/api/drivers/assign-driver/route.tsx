import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { tripId, driverId } = await req.json();

    if (!tripId || !driverId) {
      return NextResponse.json(
        { error: "tripId and driverId are required" },
        { status: 400 }
      );
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: Number(tripId) },
      data: { driverId: Number(driverId) },
      include: { Driver: true },
    });

    return NextResponse.json({ success: true, trip: updatedTrip });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to assign driver", details: error?.toString() },
      { status: 500 }
    );
  }
}
