import { NextRequest, NextResponse } from "next/server";

import { APP_BASE_URL } from "@/lib/env-constants";

const TARGET_PATH = "/onboarding";

function buildRedirectUrl(request: NextRequest, tripToken: string | null) {
  const baseUrl = APP_BASE_URL?.trim() ? APP_BASE_URL : request.url;
  const targetUrl = new URL(TARGET_PATH, baseUrl);

  if (tripToken) {
    targetUrl.searchParams.set("triptoken", tripToken);
  }

  return targetUrl;
}

export async function GET(request: NextRequest) {
  const tripToken = request.nextUrl.searchParams.get("t");
  const redirectUrl = buildRedirectUrl(request, tripToken);

  return NextResponse.redirect(redirectUrl, { status: 307 });
}

export async function HEAD(request: NextRequest) {
  const tripToken = request.nextUrl.searchParams.get("t");
  const redirectUrl = buildRedirectUrl(request, tripToken);

  return NextResponse.redirect(redirectUrl, { status: 307 });
}
