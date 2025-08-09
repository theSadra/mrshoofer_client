import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { NEXTAUTH_SECRET } from "@/lib/env-constants";

// Force hardcoded secret directly in this file as a fallback
const HARDCODED_SECRET = "vK8mN2pQ7rS9tU6wX3yZ5aB8cE1fH4iL7oP0qR3sT6uV9xA2bD5gJ8kM1nQ4rU7w";

export async function middleware(request: NextRequest) {
    // Allow access to login page
    if (request.nextUrl.pathname === "/manage/login") {
        return NextResponse.next();
    }

    // Check authentication for protected routes
    const token = await getToken({
        req: request,
        secret: HARDCODED_SECRET // Use direct hardcoded secret
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
        "/manage/((?!login).*)",  // All /manage routes except /manage/login
        "/api/admin/:path*",      // All admin API routes
    ],
};
