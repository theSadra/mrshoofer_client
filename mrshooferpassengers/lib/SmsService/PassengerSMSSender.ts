import { Smsir } from 'sms-typescript/lib';
import type { Trip, Passenger } from '@prisma/client'

const smsir = new Smsir(process.env.SMSIR_API_KEY ?? "", 1);


export async function sendPassengerSMS(phone: string, tripInfo: Trip, passenger: Passenger) {
  const result = await smsir.SendVerifyCode(
    phone,
    388906,
    [
      { name: "FIRSTNAME", value: passenger.Firstname },
      { name: "LASTNAME", value: passenger.Lastname },
      { name: "ORIGIN", value: tripInfo.OriginCity },
      { name: "DESTINATION", value: tripInfo.DestinationCity },
      { name: "LINK", value: "mrshoofer.ir" }
    ]
  );
  return result.status; // or whatever property indicates success in the smsir-js response
}
