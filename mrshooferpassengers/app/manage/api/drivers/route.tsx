import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  // Only add the filter if search is provided and not empty
  const where =
    search && search.trim().length > 0
      ? {
          OR: [
            { Firstname: { contains: search } },
            { Lastname: { contains: search } },
            { PhoneNumber: { contains: search } },
            { CarName: { contains: search } },
          ],
        }
      : undefined;

  const drivers = await prisma.driver.findMany({
    where,
    orderBy: { id: "desc" },
  });

  return NextResponse.json(drivers);
}
