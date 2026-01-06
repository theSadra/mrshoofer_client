import { NextRequest, NextResponse } from "next/server";
import { requireORSAuth } from "@/lib/ors-auth-middleware";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/partner/ping
 * Simple ping endpoint to test authentication
 */
export async function GET(req: NextRequest) {
  const authResult = requireORSAuth(req);
  if (authResult) return authResult;

  return NextResponse.json({
    status: "ok",
    message: "Authentication successful",
    timestamp: new Date().toISOString(),
    method: "GET",
    hint: "Use /api/partner/trip-create?data=BASE64 to create trips via GET",
  });
}
