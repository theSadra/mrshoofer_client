import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect();

    // Simple query to test
    const count = await prisma.trip.count();

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      tripsCount: count,
    });
  } catch (e: any) {
    console.error("Database health check failed:", e);

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: e.message,
        code: e.code,
      },
      { status: 503 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
