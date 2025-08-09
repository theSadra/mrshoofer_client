import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendPassengerSMS } from "@/lib/SmsService/PassengerSMSSender";
import { requireORSAuth } from "@/lib/ors-auth-middleware";

const prisma = new PrismaClient();

// Helper to generate a unique alphanumeric token
function generateSecureToken(length = 5) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
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
            where: { TicketCode: ticketCode }
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
        const { passenger, trip } = body;

        if (!passenger || !trip) {
            return NextResponse.json({ error: "Missing passenger or trip object" }, { status: 400 });
        }
        if (!passenger.NumberPhone) {
            return NextResponse.json({ error: "شماره تماس مسافر الزامی است" }, { status: 400 });
        }

        // Upsert passenger by NumberPhone
        const upsertedPassenger = await prisma.passenger.upsert({
            where: { NumberPhone: passenger.NumberPhone },
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

        // Generate unique TicketCode
        const uniqueTicketCode = await generateUniqueTicketCode(prisma);

        // Create trip and relate to passenger
        const newTrip = await prisma.trip.create({
            data: {
                ...trip,
                TicketCode: uniqueTicketCode, // Use unique generated code
                passengerId: upsertedPassenger.id,
                // Ensure all required fields are present
                PassengerSmsSent: false,
                AdminApproved: false,
                status: 'wating_info',
                SecureToken: generateSecureToken(),
            },
        });

        // Sending sms to client asynchronously
        sendPassengerSMS(upsertedPassenger.NumberPhone, newTrip, upsertedPassenger);

        return NextResponse.json({ trip: newTrip, passenger: upsertedPassenger }, { status: 201 });

    } catch (error: any) {
        console.error('❌ ORS Trip Creation Error:', error);

        if (error?.code === 'P2002') {
            return NextResponse.json({
                error: "Duplicate entry detected. Please try again.",
                code: 'DUPLICATE_ENTRY'
            }, { status: 409 });
        }

        return NextResponse.json({
            error: "Internal server error while creating trip",
            details: error?.message || 'Unknown error'
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
