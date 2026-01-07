import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { sendDriverSMS } from "@/lib/SmsService/DriverSMSSender";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || !(session.user as any)?.isAdmin) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 403 }
    );
  }
  
  const prisma = new PrismaClient();

  try {
    const { tripId, driverId } = await req.json();

    console.log("🚀 Driver assignment started:", { tripId, driverId });

    if (!tripId || !driverId) {
      console.log("❌ Missing required fields:", { tripId, driverId });

      return NextResponse.json(
        { success: false, error: "tripId and driverId are required" },
        { status: 400 },
      );
    }

    console.log("🔄 Updating trip with driver assignment...");
    const updatedTrip = await prisma.trip.update({
      where: { id: Number(tripId) },
      data: { driverId: Number(driverId) },
      include: { Driver: true },
    });

    console.log("✅ Trip updated successfully:", {
      tripId: updatedTrip.id,
      driverId: updatedTrip.driverId,
    });

    // Send SMS to the assigned driver (optional - NEVER fail the assignment if SMS fails)
    let smsStatus = "not_sent";
    let smsError = null;

    if (updatedTrip.Driver?.PhoneNumber) {
      try {
        console.log(
          "📱 Attempting to send SMS to driver:",
          updatedTrip.Driver.PhoneNumber,
        );
        const smsResult = await sendDriverSMS(
          updatedTrip.Driver.PhoneNumber,
          updatedTrip,
        );

        if (smsResult) {
          smsStatus = "sent";
          console.log("✅ SMS sent successfully");
        } else {
          smsStatus = "failed";
          console.log(
            "⚠️ SMS sending returned false for driver:",
            updatedTrip.Driver.PhoneNumber,
          );
        }
      } catch (error) {
        smsStatus = "failed";
        smsError = error?.toString();
        console.log("⚠️ SMS failed but assignment continues:", error);
        // Don't throw here - SMS failure should not prevent assignment
      }
    } else {
      console.log("⚠️ No phone number for driver, skipping SMS");
    }

    const response = {
      success: true,
      message: "Driver assigned successfully",
      trip: updatedTrip,
      sms: {
        status: smsStatus,
        error: smsError,
        phoneNumber: updatedTrip.Driver?.PhoneNumber,
      },
    };

    console.log("✅ Assignment completed, returning response:", response);

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Database error in assign-driver:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to assign driver",
        details: error?.toString(),
      },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Workaround for Liara WAF blocking POST
export async function PUT(req: NextRequest) {
  return POST(req);
}

// TODO : Sending SMS TO driver after driver assigned
//TODO : adding driver changed message to the previus driver
