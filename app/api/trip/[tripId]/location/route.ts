import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, TripStatus } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/trip/[tripId]/location - Get location for a trip
export async function GET(
    req: NextRequest,
    { params }: { params: { tripId: string } }
) {
    try {
        const tripId = params.tripId;

        // Find the trip by SecureToken
        const trip = await prisma.trip.findUnique({
            where: { SecureToken: tripId },
            include: {
                Location: true,
                Passenger: true
            },
        });

        if (!trip) {
            return NextResponse.json(
                { error: "Trip not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            location: trip.Location,
            trip: {
                id: trip.id,
                SecureToken: trip.SecureToken,
                TicketCode: trip.TicketCode,
                OriginCity: trip.OriginCity,
                DestinationCity: trip.DestinationCity,
                status: trip.status
            }
        });

    } catch (error) {
        console.error('Error fetching trip location:', error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// PUT /api/trip/[tripId]/location - Update location for a trip
export async function PUT(
    req: NextRequest,
    { params }: { params: { tripId: string } }
) {
    try {
        const tripId = params.tripId;
        const body = await req.json();

        // Validate required fields
        const { latitude, longitude, textAddress, description, phoneNumber } = body;

        console.log('Received coordinates from frontend:');
        console.log('Raw latitude:', latitude, 'Type:', typeof latitude);
        console.log('Raw longitude:', longitude, 'Type:', typeof longitude);
        console.log('Parsed latitude:', parseFloat(latitude));
        console.log('Parsed longitude:', parseFloat(longitude));

        if (!latitude || !longitude) {
            return NextResponse.json(
                { error: "Latitude and longitude are required" },
                { status: 400 }
            );
        }

        // Find the trip by SecureToken
        const trip = await prisma.trip.findUnique({
            where: { SecureToken: tripId },
            include: {
                Location: true,
                Driver: true,
                Passenger: true
            },
        });

        if (!trip) {
            return NextResponse.json(
                { error: "Trip not found" },
                { status: 404 }
            );
        }

        let location;

        if (trip.Location) {
            // Update existing location
            location = await prisma.location.update({
                where: { id: trip.Location.id },
                data: {
                    Latitude: parseFloat(latitude),
                    Longitude: parseFloat(longitude),
                    TextAddress: textAddress || null,
                    Description: description || null,
                    PhoneNumber: phoneNumber || null,
                },
            });
            console.log('Updated existing location in database:', {
                id: location.id,
                Latitude: location.Latitude,
                Longitude: location.Longitude
            });
        } else {
            // Create new location
            location = await prisma.location.create({
                data: {
                    Latitude: parseFloat(latitude),
                    Longitude: parseFloat(longitude),
                    TextAddress: textAddress || null,
                    Description: description || null,
                    PhoneNumber: phoneNumber || null,
                    passengerId: trip.passengerId,
                },
            });
            console.log('Created new location in database:', {
                id: location.id,
                Latitude: location.Latitude,
                Longitude: location.Longitude
            });

            // Link the new location to the trip
            await prisma.trip.update({
                where: { id: trip.id },
                data: {
                    locationId: location.id,
                    status: TripStatus.wating_start, // Update status when location is set
                },
            });
        }

        // Optional: Send SMS to driver if location is updated and driver is assigned
        if (trip.Driver && trip.Driver.PhoneNumber) {
            try {
                const { sendDriverLocationAdded } = await import("@/lib/SmsService/DriverSMSSender");
                await sendDriverLocationAdded(trip.Driver.PhoneNumber, trip);
            } catch (smsError) {
                console.error('SMS sending failed:', smsError);
                // Don't fail the request if SMS fails
            }
        }

        // Fetch updated trip data
        const updatedTrip = await prisma.trip.findUnique({
            where: { SecureToken: tripId },
            include: {
                Location: true,
                Driver: true,
                Passenger: true
            },
        });

        return NextResponse.json({
            success: true,
            message: "Location updated successfully",
            trip: updatedTrip,
            location: location
        });

    } catch (error) {
        console.error('Error updating trip location:', error);
        return NextResponse.json(
            {
                error: "Internal server error",
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// POST /api/trip/[tripId]/location - Create new location for a trip (alias for PUT)
export async function POST(
    req: NextRequest,
    { params }: { params: { tripId: string } }
) {
    return PUT(req, { params });
}
