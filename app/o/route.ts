import { NextRequest, NextResponse } from "next/server";

const TARGET_PATH = "/onboarding";

function buildRedirectUrl(request: NextRequest, tripToken: string | null) {
  const targetUrl = new URL(TARGET_PATH, request.url);

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
