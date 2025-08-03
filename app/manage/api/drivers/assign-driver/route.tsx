import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendDriverSMS } from '@/lib/SmsService/DriverSMSSender';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { tripId, driverId } = await req.json();

    if (!tripId || !driverId) {
      return NextResponse.json(
        { error: "tripId and driverId are required" },
        { status: 400 }
      );
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: Number(tripId) },
      data: { driverId: Number(driverId) },
      include: { Driver: true },
    });

    // Send SMS to the assigned driver (optional - don't fail the assignment if SMS fails)
    let smsStatus = "not_sent";
    let smsError = null;

    if (updatedTrip.Driver?.PhoneNumber) {
      try {
        const smsResult = await sendDriverSMS(updatedTrip.Driver.PhoneNumber, updatedTrip);
        if (smsResult) {
          smsStatus = "sent";
        } else {
          smsStatus = "failed";
          console.error('SMS sending returned false for driver:', updatedTrip.Driver.PhoneNumber);
        }
      } catch (error) {
        smsStatus = "failed";
        smsError = error?.toString();
        console.error('Failed to send SMS to driver:', error);
      }
    }

    return NextResponse.json({
      success: true,
      trip: updatedTrip,
      sms: {
        status: smsStatus,
        error: smsError,
        phoneNumber: updatedTrip.Driver?.PhoneNumber
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to assign driver", details: error?.toString() },
      { status: 500 }
    );
  }
}


// TODO : Sending SMS TO driver after driver assigned
//TODO : adding driver changed message to the previus driver
