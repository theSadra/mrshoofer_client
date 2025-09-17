import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    // Check if tables exist
    const tableCheck = (await prisma.$queryRaw`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('Passenger', 'Trip', 'Driver', 'User')
            ORDER BY table_name
        `) as Array<{ table_name: string }>;

    const existingTables = tableCheck.map((row) => row.table_name);
    const expectedTables = ["Driver", "Passenger", "Trip", "User"];
    const missingTables = expectedTables.filter(
      (table) => !existingTables.includes(table),
    );

    // Get migration status
    let migrationStatus = "unknown";

    try {
      const migrations =
        await prisma.$queryRaw`SELECT * FROM "_prisma_migrations" ORDER BY finished_at DESC LIMIT 5`;

      migrationStatus = Array.isArray(migrations)
        ? `${(migrations as any[]).length} migrations applied`
        : "no migrations table";
    } catch {
      migrationStatus = "no migrations table";
    }

    const allTablesExist = missingTables.length === 0;

    return NextResponse.json(
      {
        status: allTablesExist ? "ready" : "incomplete",
        database: "connected",
        schema: {
          tablesCreated: existingTables,
          missingTables: missingTables,
          allTablesExist: allTablesExist,
        },
        migrations: migrationStatus,
        timestamp: new Date().toISOString(),
        databaseUrl: process.env.DATABASE_URL?.replace(/:[^:]*@/, ":***@"), // Hide password
      },
      { status: allTablesExist ? 200 : 503 },
    );
  } catch (error) {
    console.error("Database status check failed:", error);

    return NextResponse.json(
      {
        status: "error",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
