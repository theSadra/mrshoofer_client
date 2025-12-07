import type { NextRequest } from "next/server";

import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

// Force hardcoded secret directly in this file as a fallback
const HARDCODED_SECRET =
  "vK8mN2pQ7rS9tU6wX3yZ5aB8cE1fH4iL7oP0qR3sT6uV9xA2bD5gJ8kM1nQ4rU7w";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow OTP/auth endpoints to be publicly accessible for login
  if (pathname.startsWith("/manage/api/auth")) {
    return NextResponse.next();
  }

  // Allow access to login page
  if (pathname === "/manage/login") {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  const token = await getToken({
    req: request,
    secret: HARDCODED_SECRET, // Use direct hardcoded secret
  });

  if (!token) {
    return NextResponse.redirect(new URL("/manage/login", request.url));
  }

  // Check if user is admin
  if (!token.isAdmin) {
    return NextResponse.redirect(new URL("/manage/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/manage/((?!login|api/auth).*)", // /manage routes except login & public auth endpoints
    "/api/admin/:path*", // All admin API routes
  ],
};
