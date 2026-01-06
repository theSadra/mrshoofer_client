import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

import { sendPassengerSMS } from "@/lib/SmsService/PassengerSMSSender";
import { requireORSAuth } from "@/lib/ors-auth-middleware";

// Route configuration
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

// Helper to safely get property case-insensitively
function getProperty(obj: any, ...possibleNames: string[]) {
  if (!obj || typeof obj !== "object") return undefined;

  for (const name of possibleNames) {
    if (obj[name] !== undefined) return obj[name];
    const keys = Object.keys(obj);
    const matchedKey = keys.find(
      (key) => key.toLowerCase() === name.toLowerCase(),
    );
    if (matchedKey) return obj[matchedKey];
  }
  return undefined;
}

// Helper to generate a unique alphanumeric token
function generateSecureToken(length = 16) {
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
    const ticketCode = generateSecureToken(8);
    const existing = await prisma.trip.findUnique({
      where: { TicketCode: ticketCode },
    });
    if (!existing) {
      return ticketCode;
    }
  }
  return `TC${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

/**
 * GET /api/partner/trip-create
 * 
 * WORKAROUND ENDPOINT: Uses GET with base64-encoded data in query params
 * to bypass Liara WAF that blocks POST requests.
 * 
 * Usage:
 *   GET /api/partner/trip-create?data=BASE64_ENCODED_JSON
 * 
 * The 'data' parameter should be base64-encoded JSON with the same structure
 * as the POST body:
 * {
 *   "passenger": { "NumberPhone": "...", "Firstname": "...", ... },
 *   "trip": { "origin": "...", "destination": "...", ... }
 * }
 */
export async function GET(req: NextRequest) {
  const authResult = requireORSAuth(req);
  if (authResult) return authResult;

  try {
    const { searchParams } = new URL(req.url);
    const encodedData = searchParams.get("data");

    if (!encodedData) {
      return NextResponse.json(
        { error: "Missing 'data' query parameter. Provide base64-encoded JSON." },
        { status: 400 },
      );
    }

    // Decode base64 data
    let body: any;
    try {
      const decodedData = Buffer.from(encodedData, "base64").toString("utf-8");
      body = JSON.parse(decodedData);
    } catch (decodeError) {
      return NextResponse.json(
        { error: "Invalid base64 or JSON in 'data' parameter" },
        { status: 400 },
      );
    }

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

    // Case-insensitive property access for trip
    const rawOrigin = getProperty(trip, "origin", "Origin");
    const rawDestination = getProperty(trip, "destination", "Destination");
    const rawDate = getProperty(trip, "date", "Date");
    const rawTime = getProperty(trip, "time", "Time");
    const price = getProperty(trip, "price", "Price");
    const count = getProperty(trip, "count", "Count");
    const transferType = getProperty(trip, "transferType", "TransferType");
    const originAddress = getProperty(trip, "originAddress", "OriginAddress");
    const destAddress = getProperty(trip, "destAddress", "DestAddress");
    const description = getProperty(trip, "description", "Description");

    // Validate required trip fields
    if (!rawOrigin || !rawDestination || !rawDate || !rawTime) {
      return NextResponse.json(
        { error: "Missing required trip fields (origin, destination, date, time)" },
        { status: 400 },
      );
    }

    // Normalize origin/destination
    const origin = typeof rawOrigin === "object" && rawOrigin.name ? rawOrigin.name : String(rawOrigin);
    const destination = typeof rawDestination === "object" && rawDestination.name ? rawDestination.name : String(rawDestination);

    // Parse date
    let tripDate: Date;
    if (typeof rawDate === "object" && rawDate.year && rawDate.month && rawDate.day) {
      const dateStr = `${rawDate.year}/${rawDate.month}/${rawDate.day}`;
      tripDate = new Date(dateStr);
    } else if (typeof rawDate === "string") {
      tripDate = new Date(rawDate);
    } else {
      tripDate = new Date();
    }

    // Parse time
    let timeObj = { hours: 0, minutes: 0 };
    if (typeof rawTime === "object" && rawTime.hours !== undefined) {
      timeObj = { hours: rawTime.hours, minutes: rawTime.minutes || 0 };
    } else if (typeof rawTime === "string") {
      const timeParts = rawTime.split(":");
      timeObj.hours = parseInt(timeParts[0]) || 0;
      timeObj.minutes = parseInt(timeParts[1]) || 0;
    }

    // Check for existing passenger or create new
    let passengerRecord = await prisma.passenger.findUnique({
      where: { PhoneNumber: numberPhone },
    });

    if (!passengerRecord) {
      passengerRecord = await prisma.passenger.create({
        data: {
          PhoneNumber: numberPhone,
          FirstName: firstName || "",
          LastName: lastName || "",
          NaCode: naCode || "",
        },
      });
    }

    // Generate unique TicketCode
    const ticketCode = await generateUniqueTicketCode(prisma);

    // Create trip
    const newTrip = await prisma.trip.create({
      data: {
        Origin: origin,
        Destination: destination,
        TransferType: transferType || "city-to-city",
        Date: tripDate,
        Hour: timeObj.hours,
        Minute: timeObj.minutes,
        Price: price ? parseInt(String(price)) : null,
        OriginAddress: originAddress || null,
        DestAddress: destAddress || null,
        Count: count ? parseInt(String(count)) : 1,
        Description: description || null,
        Status: "Pending",
        IsPaid: false,
        TicketCode: ticketCode,
        passenger: { connect: { id: passengerRecord.id } },
      },
    });

    // Try to send SMS (don't fail if SMS fails)
    try {
      await sendPassengerSMS({
        phoneNumber: numberPhone,
        ticketCode: ticketCode,
        tripInfo: {
          origin,
          destination,
          date: tripDate.toLocaleDateString("fa-IR"),
          time: `${timeObj.hours}:${String(timeObj.minutes).padStart(2, "0")}`,
        },
      });
    } catch (smsError) {
      console.error("SMS send error (non-critical):", smsError);
    }

    // Return created trip and passenger info - using 200 for GET
    return NextResponse.json(
      {
        trip: {
          id: newTrip.id,
          TicketCode: newTrip.TicketCode,
          Origin: newTrip.Origin,
          Destination: newTrip.Destination,
          Date: newTrip.Date,
          Hour: newTrip.Hour,
          Minute: newTrip.Minute,
          Status: newTrip.Status,
          Price: newTrip.Price,
        },
        passenger: {
          id: passengerRecord.id,
          PhoneNumber: passengerRecord.PhoneNumber,
          FirstName: passengerRecord.FirstName,
          LastName: passengerRecord.LastName,
        },
        message: "Trip created successfully via GET workaround",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Partner trip-create error:", error);
    return NextResponse.json(
      {
        error: "Failed to create trip",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
