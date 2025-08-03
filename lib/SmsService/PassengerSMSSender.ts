import { Smsir } from 'sms-typescript/lib';
import type { Trip, Passenger } from '@prisma/client'
import { SMSIR_API_KEY, APP_BASE_URL } from '@/lib/env-constants';

// Use centralized env constants
const smsir = new Smsir(SMSIR_API_KEY, 1);


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
