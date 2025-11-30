import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

import { sendPassengerSMS } from "@/lib/SmsService/PassengerSMSSender";
import { requireORSAuth } from "@/lib/ors-auth-middleware";

const prisma = new PrismaClient();

// Helper to safely get property case-insensitively
function getProperty(obj: any, ...possibleNames: string[]) {
  if (!obj || typeof obj !== "object") return undefined;

  for (const name of possibleNames) {
    // Try exact match first
    if (obj[name] !== undefined) return obj[name];

    // Try case-insensitive match
    const keys = Object.keys(obj);
    const matchedKey = keys.find(
      (key) => key.toLowerCase() === name.toLowerCase(),
    );

    if (matchedKey) return obj[matchedKey];
  }

  return undefined;
}

// Helper to generate a unique alphanumeric token
function generateSecureToken(length = 5) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";

  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return token;
}

// Helper to generate unique TicketCode with retry logic
async function generateUniqueTicketCode(prisma: PrismaClient, maxRetries = 10) {
  for (let i = 0; i < maxRetries; i++) {
    const ticketCode = generateSecureToken(8); // Longer to reduce collision
    const existing = await prisma.trip.findUnique({
      where: { TicketCode: ticketCode },
    });

    if (!existing) {
      return ticketCode;
    }
  }

  // Fallback: use timestamp + random
  return `TC${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

// POST /ORS/api/trip
export async function POST(req: NextRequest) {
  const authResult = requireORSAuth(req);

  if (authResult) return authResult;

  try {
    const body = await req.json();

    const passenger = getProperty(body, "passenger", "Passenger");
    const trip = getProperty(body, "trip", "Trip");

    if (!passenger || !trip) {
      return NextResponse.json(
        { error: "Missing passenger or trip object" },
        { status: 400 },
      );
    }

    // Case-insensitive property access for passenger
    const numberPhone = getProperty(
      passenger,
      "NumberPhone",
      "numberPhone",
      "numberphone",
    );
    const firstName = getProperty(
      passenger,
      "Firstname",
      "firstName",
      "firstname",
    );
    const lastName = getProperty(passenger, "Lastname", "lastName", "lastname");
    const naCode = getProperty(passenger, "NaCode", "naCode", "nacode");

    if (!numberPhone || numberPhone.trim() === "") {
      return NextResponse.json(
        { error: "شماره تماس مسافر الزامی است" },
        { status: 400 },
      );
    }

    // Upsert passenger by NumberPhone
    const upsertedPassenger = await prisma.passenger.upsert({
      where: { NumberPhone: numberPhone },
      update: {
        Firstname: firstName,
        Lastname: lastName,
        NaCode: naCode ?? undefined,
      },
      create: {
        Firstname: firstName,
        Lastname: lastName,
        NumberPhone: numberPhone,
        NaCode: naCode ?? undefined,
      },
    });

    // Case-insensitive trip properties
    const TEHRAN_OFFSET_MINUTES = 210; // UTC+3:30 without DST

    function parseLocalNaive(isoOrDate: any): Date | undefined {
      if (!isoOrDate) return undefined;
      if (isoOrDate instanceof Date) return isoOrDate;

      const s = String(isoOrDate).trim();
      if (!s) return undefined;

      // If the incoming string already has an explicit timezone (e.g. Z or +0330)
      // defer to native parsing to preserve the exact instant.
      const hasExplicitTz = /[zZ]|[+-]\d{2}:?\d{2}$/.test(s);
      if (hasExplicitTz) {
        const parsed = new Date(s);

        return isNaN(parsed.getTime()) ? undefined : parsed;
      }

      const m = s.match(
        /^(\d{4})-(\d{2})-(\d{2})[Tt ](\d{2}):(\d{2})(?::(\d{2}))?/
      );

      if (m) {
        const [, Y, Mo, D, H, Mi, S] = m;
        const utcMs =
          Date.UTC(
            Number(Y),
            Number(Mo) - 1,
            Number(D),
            Number(H),
            Number(Mi),
            S ? Number(S) : 0,
          ) -
          TEHRAN_OFFSET_MINUTES * 60 * 1000;

        const result = new Date(utcMs);

        return isNaN(result.getTime()) ? undefined : result;
      }

      const fallback = new Date(s);

      return isNaN(fallback.getTime()) ? undefined : fallback;
    }

    const inputTicketCode = getProperty(trip, "TicketCode", "ticketCode", "ticketcode");
    
    // Use input TicketCode if provided, otherwise generate unique one
    let finalTicketCode: string;
    if (inputTicketCode && typeof inputTicketCode === 'string' && inputTicketCode.trim() !== '') {
      // Validate that the provided TicketCode is not already in use
      const existingTrip = await prisma.trip.findUnique({
        where: { TicketCode: inputTicketCode.trim() },
      });
      
      if (existingTrip) {
        return NextResponse.json(
          { error: `TicketCode "${inputTicketCode}" is already in use`, code: "DUPLICATE_TICKET_CODE" },
          { status: 409 },
        );
      }
      
      finalTicketCode = inputTicketCode.trim();
    } else {
      // Generate unique TicketCode only if not provided
      finalTicketCode = await generateUniqueTicketCode(prisma);
    }

    const tripData = {
      TripCode: getProperty(trip, "TripCode", "tripCode", "tripcode"),
      Origin_id: getProperty(trip, "Origin_id", "origin_id", "originId"),
      Destination_id: getProperty(
        trip,
        "Destination_id",
        "destination_id",
        "destinationId",
      ),
      OriginCity: getProperty(trip, "OriginCity", "originCity", "origincity"),
      DestinationCity: getProperty(
        trip,
        "DestinationCity",
        "destinationCity",
        "destinationcity",
      ),
      CarName: getProperty(trip, "CarName", "carName", "carname"),
      ServiceName: getProperty(
        trip,
        "ServiceName",
        "serviceName",
        "servicename",
      ),
      StartsAt: parseLocalNaive(
        getProperty(trip, "StartsAt", "startsAt", "startsat"),
      ),
    };

    // Create trip and relate to passenger
    const newTrip = await prisma.trip.create({
      data: {
        ...tripData,
        TicketCode: finalTicketCode, // Use input TicketCode or generated one
        passengerId: upsertedPassenger.id,
        PassengerSmsSent: false,
        AdminApproved: false,
        status: "wating_info",
        SecureToken: generateSecureToken(),
      },
    });

    // Sending sms to client asynchronously
    sendPassengerSMS(upsertedPassenger.NumberPhone, newTrip, upsertedPassenger);

    return NextResponse.json(
      { trip: newTrip, passenger: upsertedPassenger },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("❌ ORS Trip Creation Error:", error);

    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          error: "Duplicate entry detected. Please try again.",
          code: "DUPLICATE_ENTRY",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error while creating trip",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
