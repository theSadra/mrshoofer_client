import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, TripStatus } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dayParam = searchParams.get("day");

  let where = {};
  if (dayParam) {
    const day = new Date(dayParam);
    const startOfDay = new Date(day);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(day);
    endOfDay.setHours(23, 59, 59, 999);

    where = {
      StartsAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    };
  }

  const trips = await prisma.trip.findMany({
    orderBy: { StartsAt: "asc" },
    include: {
      Driver: true,
    },
  });

  return NextResponse.json(trips);
}
