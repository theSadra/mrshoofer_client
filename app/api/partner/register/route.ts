import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

import { requireORSAuth } from "@/lib/ors-auth-middleware";

// Route configuration - ensure this route is completely public
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

// POST /api/partner/register
// Register a new passenger in the system
export async function POST(req: NextRequest) {
  // Authenticate the request
  const authResult = requireORSAuth(req);
  if (authResult) return authResult;

  try {
    const body = await req.json();

    // Extract passenger data with case-insensitive property access
    const numberPhone = body.NumberPhone || body.numberPhone || body.phone;
    const firstName = body.Firstname || body.firstName || body.firstname;
    const lastName = body.Lastname || body.lastName || body.lastname;
    const naCode = body.NaCode || body.naCode || body.nationalCode;

    // Validate required fields
    if (!numberPhone || numberPhone.trim() === "") {
      return NextResponse.json(
        { 
          error: "شماره تماس الزامی است",
          errorEn: "Phone number is required"
        },
        { status: 400 }
      );
    }

    // Normalize phone number (remove spaces, dashes, etc.)
    const normalizedPhone = numberPhone.trim().replace(/[\s\-]/g, "");

    // Check if passenger already exists
    const existingPassenger = await prisma.passenger.findUnique({
      where: { NumberPhone: normalizedPhone },
    });

    if (existingPassenger) {
      return NextResponse.json(
        {
          success: true,
          message: "مسافر قبلاً ثبت شده است",
          messageEn: "Passenger already registered",
          passenger: {
            id: existingPassenger.id,
            NumberPhone: existingPassenger.NumberPhone,
            Firstname: existingPassenger.Firstname,
            Lastname: existingPassenger.Lastname,
            NaCode: existingPassenger.NaCode,
            createdAt: existingPassenger.createdAt,
          },
          isNew: false,
        },
        { status: 200 }
      );
    }

    // Create new passenger
    const newPassenger = await prisma.passenger.create({
      data: {
        NumberPhone: normalizedPhone,
        Firstname: firstName?.trim() || "",
        Lastname: lastName?.trim() || "",
        NaCode: naCode?.trim() || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "مسافر با موفقیت ثبت شد",
        messageEn: "Passenger registered successfully",
        passenger: {
          id: newPassenger.id,
          NumberPhone: newPassenger.NumberPhone,
          Firstname: newPassenger.Firstname,
          Lastname: newPassenger.Lastname,
          NaCode: newPassenger.NaCode,
          createdAt: newPassenger.createdAt,
        },
        isNew: true,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[ORS Register Error]", error);

    return NextResponse.json(
      {
        error: "خطا در ثبت مسافر",
        errorEn: "Failed to register passenger",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// GET /api/partner/register?phone=XXXXXXXXXX
// Check if a passenger exists by phone number
export async function GET(req: NextRequest) {
  // Authenticate the request
  const authResult = requireORSAuth(req);
  if (authResult) return authResult;

  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone") || searchParams.get("NumberPhone");

    if (!phone) {
      return NextResponse.json(
        { 
          error: "شماره تماس الزامی است",
          errorEn: "Phone number is required"
        },
        { status: 400 }
      );
    }

    // Normalize phone number
    const normalizedPhone = phone.trim().replace(/[\s\-]/g, "");

    // Find passenger
    const passenger = await prisma.passenger.findUnique({
      where: { NumberPhone: normalizedPhone },
    });

    if (!passenger) {
      return NextResponse.json(
        {
          exists: false,
          message: "مسافر یافت نشد",
          messageEn: "Passenger not found"
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        exists: true,
        passenger: {
          id: passenger.id,
          NumberPhone: passenger.NumberPhone,
          Firstname: passenger.Firstname,
          Lastname: passenger.Lastname,
          NaCode: passenger.NaCode,
          createdAt: passenger.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[ORS Register Check Error]", error);

    return NextResponse.json(
      {
        error: "خطا در بررسی مسافر",
        errorEn: "Failed to check passenger",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/partner/register - WORKAROUND for Liara WAF blocking POST requests
// This is identical to POST but uses PUT method which bypasses the WAF
export async function PUT(req: NextRequest) {
  return POST(req);
}
