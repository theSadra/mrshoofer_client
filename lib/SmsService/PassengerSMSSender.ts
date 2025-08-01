import { Smsir } from 'sms-typescript/lib';
import type { Trip, Passenger } from '@prisma/client'

// Hardcoded SMS API key for production reliability
const smsir = new Smsir(process.env.SMSIR_API_KEY ?? "YJure760oRHOgR01yMMB9R0my7cLtNOlscPgMLazgZCQhVy6", 1);
// const APP_BASE_URL = process.env.APP_BASE_URL || "https://webapp.mrshoofer.ir";


export async function sendPassengerSMS(phone: string, tripInfo: any, passenger: Passenger) {
  // const link = `${APP_BASE_URL}/trip/info/${tripInfo.SecureToken}`;
  try {
    const result = await smsir.SendVerifyCode(
      phone,
      388906,
      [
        { name: "FIRSTNAME", value: passenger.Firstname },
        { name: "LASTNAME", value: passenger.Lastname },
        { name: "ORIGIN", value: tripInfo.OriginCity },
        { name: "DESTINATION", value: tripInfo.DestinationCity },
        { name: "TRIPCCODE", value: tripInfo.SecureToken },
      ]
    );
    return result.status;
  } catch (error) {
    console.log(error)
    return false;
  }
}
