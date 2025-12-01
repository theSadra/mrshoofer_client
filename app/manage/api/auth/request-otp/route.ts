import { NextResponse, NextRequest } from "next/server";

import prisma from "@/lib/prisma";
import { sendAdminOtpSMS } from "@/lib/SmsService/AdminSMSSender";
import { normalizeIranPhoneNumber } from "@/lib/phone-utils";
import { getAdminOtpRecord, saveAdminOtpRecord } from "@/lib/otp-store";

const OTP_EXPIRATION_MINUTES = 5;
const RESEND_WINDOW_SECONDS = 60;

function generateOtpCode(length = 5): string {
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;

  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

export async function POST(request: NextRequest) {
  // 1. Parse request body
  let body: { phone?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "درخواست نامعتبر است" },
      { status: 400 },
    );
  }

  // 2. Normalize & validate phone
  const normalizedPhone = normalizeIranPhoneNumber(body?.phone);

  if (!normalizedPhone) {
    return NextResponse.json(
      { error: "شماره موبایل معتبر نیست" },
      { status: 400 },
    );
  }

  // 3. Check admin exists with this phone
  let adminUser: { id: string } | null = null;

  try {
    adminUser = await prisma.user.findFirst({
      where: { isAdmin: true, phoneNumber: normalizedPhone },
      select: { id: true },
    });
  } catch (dbError) {
    console.error("[OTP] Database error:", dbError);

    return NextResponse.json(
      { error: "خطا در دسترسی به پایگاه داده" },
      { status: 500 },
    );
  }

  if (!adminUser) {
    return NextResponse.json(
      { error: "مدیر معتبری با این شماره یافت نشد" },
      { status: 404 },
    );
  }

  // 4. Rate-limit: prevent spam requests
  const existing = getAdminOtpRecord(normalizedPhone);

  if (existing && Date.now() - existing.lastSentAt < RESEND_WINDOW_SECONDS * 1000) {
    const remaining = Math.ceil(
      (RESEND_WINDOW_SECONDS * 1000 - (Date.now() - existing.lastSentAt)) / 1000,
    );

    return NextResponse.json(
      { error: `لطفاً ${remaining} ثانیه صبر کنید` },
      { status: 429 },
    );
  }

  // 5. Generate OTP code
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

  // 6. Send SMS
  let smsSent = false;

  try {
    smsSent = await sendAdminOtpSMS(normalizedPhone, code);
  } catch (smsError) {
    console.error("[OTP] SMS send error:", smsError);
  }

  if (!smsSent) {
    return NextResponse.json(
      { error: "ارسال پیامک با خطا مواجه شد" },
      { status: 500 },
    );
  }

  // 7. Store OTP in memory for verification later
  saveAdminOtpRecord(normalizedPhone, code, expiresAt);

  // 8. Success response
  return NextResponse.json({ success: true });
}
