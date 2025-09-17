import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "healthy",
        database: "connected",
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || "1.0.0",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Health check failed:", error);

    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        error: "Service unavailable",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    );
  }
}
