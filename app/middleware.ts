import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    console.log("🔒 Middleware checking:", request.nextUrl.pathname);

    // Allow access to login page
    if (request.nextUrl.pathname === "/manage/login") {
        console.log("✅ Allowing access to login page");
        return NextResponse.next();
    }

    // Check authentication for protected routes
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
    });

    if (!token) {
        console.log("❌ No token found, redirecting to login");
        return NextResponse.redirect(new URL("/manage/login", request.url));
    }

    // Check if user is admin
    if (!token.isAdmin) {
        console.log("❌ User is not admin, redirecting to login");
        return NextResponse.redirect(new URL("/manage/login", request.url));
    }

    console.log("✅ Admin access granted for:", token.email);
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/manage/((?!login).*)",  // All /manage routes except /manage/login
        "/api/admin/:path*",      // All admin API routes
    ],
};
