import { NextRequest, NextResponse } from "next/server";

import { APP_BASE_URL } from "@/lib/env-constants";

const ONBOARDING_PATH = "/onboarding";

function buildRedirectUrl(
  request: NextRequest,
  tripToken: string | null,
  path: string,
) {
  const baseUrl = APP_BASE_URL?.trim() ? APP_BASE_URL : request.url;
  const targetUrl = new URL(path, baseUrl);

  if (tripToken) {
    targetUrl.searchParams.set("triptoken", tripToken);
  }

  return targetUrl;
}

/**
 * Main redirect handler for /o route
 * This route serves as the entry point for trips.
 *
 * Flow:
 * - First time users: /o?t={token} → /onboarding?triptoken={token}
 * - Returning users: Handled client-side by checking localStorage
 *
 * Note: We always redirect to onboarding first. The onboarding page
 * will check localStorage and redirect to trip info if already completed.
 * This avoids complex server-side cookie logic while maintaining smooth UX.
 */
export async function GET(request: NextRequest) {
  const tripToken = request.nextUrl.searchParams.get("t");

  // Always redirect to onboarding page
  // The onboarding page will handle checking completion status client-side
  const redirectUrl = buildRedirectUrl(request, tripToken, ONBOARDING_PATH);

  return NextResponse.redirect(redirectUrl, { status: 307 });
}

export async function HEAD(request: NextRequest) {
  const tripToken = request.nextUrl.searchParams.get("t");
  const redirectUrl = buildRedirectUrl(request, tripToken, ONBOARDING_PATH);

  return NextResponse.redirect(redirectUrl, { status: 307 });
}
