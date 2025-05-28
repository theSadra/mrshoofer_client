import { Smsir } from 'sms-typescript/lib';
import { Trip } from '@prisma/client';


const smsir = new Smsir(process.env.SMSIR_API_KEY ?? "", 1);

// SMSIR template id
const templteid = 993093;


export async function sendDriverSMS(driverphone: string, tripInfo: Trip) {
  // const link = `${APP_BASE_URL}/trip/info/${tripInfo.SecureToken}`;
  try {
    const result = await smsir.SendVerifyCode(
      driverphone,
      templteid,
      [
        { name: "ORIGIN", value: tripInfo.OriginCity },
        { name: "DESTINATION", value: tripInfo.DestinationCity },
        { name: "SECRETCODE", value: tripInfo.SecureToken },
      ]
    );
    return result.status;
  } catch (error) {
    return false;
  }
}

///TODO : adding driver changed message to the previus driver