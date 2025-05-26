import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendPassengerSMS } from "@/lib/SmsService/PassengerSMSSender";

const prisma = new PrismaClient();

// Helper to generate a 9-character unique token
function generateSecureToken(length = 9) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

// POST /ORS/api/trip
export async function POST(req: NextRequest) {
    // try {
    const body = await req.json();
    const { passenger, trip } = body;
    if (!passenger || !trip) {
        return NextResponse.json({ error: "Missing passenger or trip object" }, { status: 400 });
    }
    if (!passenger.NumberPhone) {
        return NextResponse.json({ error: "شماره تماس مسافر الزامی است" }, { status: 400 });
    }
    // Upsert passenger by NumberPhone
    // Prisma's upsert only supports unique fields. Make sure NumberPhone is unique in your schema!
    const upsertedPassenger = await prisma.passenger.upsert({
        where: { NumberPhone: passenger.NumberPhone }, // <-- This will only work if NumberPhone is unique
        update: {
            Firstname: passenger.Firstname,
            Lastname: passenger.Lastname,
            NaCode: passenger.NaCode ?? undefined,
        },
        create: {
            Firstname: passenger.Firstname,
            Lastname: passenger.Lastname,
            NumberPhone: passenger.NumberPhone,
            NaCode: passenger.NaCode ?? undefined,
        },
    });
    // Create trip and relate to passenger
    const newTrip = await prisma.trip.create({
        data: {
            ...trip,
            passengerId: upsertedPassenger.id,
            // Ensure all required fields are present
            PassengerSmsSent: false,
            AdminApproved: false,
            status: 'wating_info',
            SecureToken: generateSecureToken(),
        },
    });
    // Sending sms to client asycronously

    sendPassengerSMS(upsertedPassenger.NumberPhone, newTrip, upsertedPassenger);

    // Example: send SMS after trip creation
    return NextResponse.json({ trip: newTrip, passenger: upsertedPassenger }, { status: 201 });
    // } catch (error) {
    //     return NextResponse.json({ error: "خطا در ثبت سفر" }, { status: 500 });
    // }
}
