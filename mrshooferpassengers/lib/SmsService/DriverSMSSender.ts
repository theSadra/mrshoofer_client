import { Smsir } from 'sms-typescript/lib';
import { Trip } from '@prisma/client';
import PersianDate from "persian-date";


const smsir = new Smsir(process.env.SMSIR_API_KEY ?? "", 1);

// SMSIR template id


export async function sendDriverSMS(driverphone: string, tripInfo: Trip) {
  const templteid = 993093;
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



export async function sendDriverLocationAdded(driverphone: string, tripInfo: Trip) {
  // const link = `${APP_BASE_URL}/trip/info/${tripInfo.SecureToken}`;
  const templteid = 809560;

  // Format Persian date and time from tripInfo.StartsAt
  let dateStr = "";
  let hourStr = "";
  if (tripInfo.StartsAt) {
    const pd = new PersianDate(new Date(tripInfo.StartsAt));
    dateStr = pd.format("YYYY/MM/DD");
    hourStr = pd.format("HH:mm");
  }

  try {
    const result = await smsir.SendVerifyCode(
      driverphone,
      templteid,
      [
        { name: "ORIGIN", value: tripInfo.OriginCity },
        { name: "DESTINATION", value: tripInfo.DestinationCity },
        { name: "DATE", value: dateStr },
        { name: "HOUR", value: hourStr },
        { name: "SECRETCODE", value: tripInfo.SecureToken },
      ]
    );
    return result.status;
  } catch (error) {
    return false;
  }
}



export async function sendDriverTripCanceled(driverphone: string, tripInfo: Trip) {
  // const link = `${APP_BASE_URL}/trip/info/${tripInfo.SecureToken}`;
  const templteid = 486412;

  // Format Persian date and time from tripInfo.StartsAt
  let dateStr = "";
  let hourStr = "";
  if (tripInfo.StartsAt) {
    const pd = new PersianDate(new Date(tripInfo.StartsAt));
    dateStr = pd.format("YYYY/MM/DD");
    hourStr = pd.format("HH:mm");
  }

  try {
    const result = await smsir.SendVerifyCode(
      driverphone,
      templteid,
      [
        { name: "ORIGIN", value: tripInfo.OriginCity },
        { name: "DESTINATION", value: tripInfo.DestinationCity },
        { name: "DATE", value: dateStr },
        { name: "HOUR", value: hourStr },
        { name: "SECRETCODE", value: tripInfo.SecureToken },
      ]
    );
    return result.status;
  } catch (error) {
    return false;
  }
}


///TODO : adding driver changed message to the previus driver