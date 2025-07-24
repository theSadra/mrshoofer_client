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


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { Firstname, Lastname, PhoneNumber, CarName } = body;
    if (!Firstname || !Lastname || !PhoneNumber || !CarName) {
      return NextResponse.json({ error: "تمام فیلدها الزامی هستند" }, { status: 400 });
    }
    const newDriver = await prisma.driver.create({
      data: {
        Firstname,
        Lastname,
        PhoneNumber,
        CarName,
      },
    });
    return NextResponse.json(newDriver, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "خطا در ایجاد راننده جدید" }, { status: 500 });
  }
}
