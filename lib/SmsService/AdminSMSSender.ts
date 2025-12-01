import { Smsir } from "sms-typescript/lib";

import {
  SMSIR_API_KEY,
  SMSIR_MANAGE_OTP_TEMPLATE_ID,
} from "@/lib/env-constants";

const smsirClient = new Smsir(SMSIR_API_KEY, 1);

export async function sendAdminOtpSMS(phone: string, code: string) {
  try {
    console.log("[AdminOTP] Sending OTP to", phone, "with template", SMSIR_MANAGE_OTP_TEMPLATE_ID);
    const result = await smsirClient.SendVerifyCode(
      phone,
      SMSIR_MANAGE_OTP_TEMPLATE_ID,
      [{ name: "CODE", value: code }],
    );

    // Log only safe properties (avoid circular refs from HTTP objects)
    console.log("[AdminOTP] SMSIR response status:", result?.status, "data:", result?.data);

    // SMSIR may return status=1 or status=200 depending on SDK version
    const success =
      result?.status === 1 ||
      result?.status === 200 ||
      (result as any)?.Status === 1 ||
      (result as any)?.data?.status === 1;

    console.log("[AdminOTP] SMS sent successfully:", success);

    return success;
  } catch (error) {
    console.error("[AdminOTP] sendAdminOtpSMS error", error);

    return false;
  }
}
