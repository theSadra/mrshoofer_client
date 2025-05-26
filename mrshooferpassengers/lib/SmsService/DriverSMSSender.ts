import { sendSMS } from "./index";

export async function sendDriverSMS(phone: string, tripInfo: { TicketCode: string }) {
  const message = `راننده عزیز، سفر جدید با کد ${tripInfo.TicketCode} به شما اختصاص یافت.`;
  return sendSMS(phone, message);
}
