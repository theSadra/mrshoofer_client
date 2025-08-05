import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { sendDriverSMS } from '@/lib/SmsService/DriverSMSSender';

export async function POST(req: NextRequest) {
  const prisma = new PrismaClient();
  
  try {
    const { tripId, driverId } = await req.json();
    console.log('Assign driver request:', { tripId, driverId });

    if (!tripId || !driverId) {
      console.log('Missing required fields:', { tripId, driverId });
      return NextResponse.json(
        { error: "tripId and driverId are required" },
        { status: 400 }
      );
    }

    console.log('Updating trip with driver assignment...');
    const updatedTrip = await prisma.trip.update({
      where: { id: Number(tripId) },
      data: { driverId: Number(driverId) },
      include: { Driver: true },
    });
    console.log('Trip updated successfully:', { tripId: updatedTrip.id, driverId: updatedTrip.driverId });

    // Send SMS to the assigned driver (optional - don't fail the assignment if SMS fails)
    let smsStatus = "not_sent";
    let smsError = null;

    if (updatedTrip.Driver?.PhoneNumber) {
      try {
        console.log('Sending SMS to driver:', updatedTrip.Driver.PhoneNumber);
        const smsResult = await sendDriverSMS(updatedTrip.Driver.PhoneNumber, updatedTrip);
        if (smsResult) {
          smsStatus = "sent";
          console.log('SMS sent successfully');
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

    const response = {
      success: true,
      trip: updatedTrip,
      sms: {
        status: smsStatus,
        error: smsError,
        phoneNumber: updatedTrip.Driver?.PhoneNumber
      }
    };
    console.log('Returning successful response:', response);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Database error in assign-driver:', error);
    return NextResponse.json(
      { error: "Failed to assign driver", details: error?.toString() },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}


// TODO : Sending SMS TO driver after driver assigned
//TODO : adding driver changed message to the previus driver
