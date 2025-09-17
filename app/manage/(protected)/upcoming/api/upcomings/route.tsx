import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dayParam = searchParams.get("day");

    let trips: any[] = [];

    if (dayParam) {
      // Parse the input date and build UTC day boundaries (preserving wall clock)
      const [year, month, day] = dayParam.split("-").map(Number);
      const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      const end = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0));

      trips = await prisma.trip.findMany({
        where: {
          AND: [{ StartsAt: { gte: start } }, { StartsAt: { lt: end } }],
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
  } catch (error) {
    console.error(
      "GET /manage/(protected)/upcoming/api/upcomings failed; returning empty [] fallback",
      error,
    );

    return NextResponse.json([], {
      status: 200,
      headers: { "x-fallback": "true" },
    });
  }
}
