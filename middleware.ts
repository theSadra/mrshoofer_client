import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        // Check if user is trying to access admin routes
        if (req.nextUrl.pathname.startsWith("/manage")) {
            // Allow access to login page
            if (req.nextUrl.pathname === "/manage/login") {
                return NextResponse.next();
            }

            // For other manage routes, check if user is admin
            if (!req.nextauth.token?.isAdmin) {
                return NextResponse.redirect(new URL("/manage/login", req.url));
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                // Allow access to login page without token
                if (req.nextUrl.pathname === "/manage/login") {
                    return true;
                }

                // For other manage routes, require admin token
                if (req.nextUrl.pathname.startsWith("/manage")) {
                    return !!token && !!token.isAdmin;
                }

                // Allow all other routes
                return true;
            },
        },
    }
);

export const config = {
    matcher: [
        "/manage/:path*",
        "/api/admin/:path*",
    ]
};
