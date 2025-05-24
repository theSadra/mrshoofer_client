import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dayParam = searchParams.get("day");

  let trips: any[] = [];
  if (dayParam) {
    // Parse the input date
    const [year, month, day] = dayParam.split("-").map(Number);
    // Find trips where StartsAt date matches the input date (ignoring time)
    trips = await prisma.trip.findMany({
      where: {
        AND: [
          { StartsAt: { gte: new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0)) } },
          { StartsAt: { lt: new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0)) } },
        ],
      },
      orderBy: { StartsAt: "asc" },
      include: {
        Driver: true,
        Passenger: true,
        Location: true,
      },
    });
  }

  return NextResponse.json(trips);
}