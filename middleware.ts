import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

// CRITICAL: Check ORS routes BEFORE NextAuth wrapper
// ORS routes must NEVER be protected - they use their own token-based auth
export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow ALL /ORS routes to bypass authentication completely (case-insensitive)
  // This must happen BEFORE withAuth is invoked
  const pathLower = pathname.toLowerCase();
  if (pathLower.startsWith("/ors")) {
    console.log(`[Middleware] ✅ BYPASSING ALL AUTH for ORS route: ${pathname}`);
    // Set a header to indicate ORS bypass for debugging
    const response = NextResponse.next();
    response.headers.set('X-ORS-Bypass', 'true');
    return response;
  }

  // Double-check: Explicitly allow ORS API routes
  if (pathname.startsWith("/ORS/") || pathname.startsWith("/ors/")) {
    console.log(`[Middleware] ✅ BYPASSING ALL AUTH for ORS API: ${pathname}`);
    const response = NextResponse.next();
    response.headers.set('X-ORS-Bypass', 'true');
    return response;
  }

  // For all other routes, use NextAuth middleware
  return withAuthMiddleware(req);
}

const withAuthMiddleware = withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token as any;
    const isApi = pathname.startsWith("/api/");

    // Helper to handle unauthorized consistently
    const deny = (reason: string) => {
      if (isApi) {
        return NextResponse.json({ error: "Forbidden", reason }, { status: 403 });
      }
      const url = new URL("/403", req.url);
      url.searchParams.set("r", pathname); // keep reference
      return NextResponse.redirect(url);
    };

    // Public manage login always allowed
    if (pathname === "/manage/login") return NextResponse.next();

    // OTP request endpoint must stay public so admins can receive codes before logging in
    if (pathname === "/manage/api/auth/request-otp") {
      return NextResponse.next();
    }

    // Superadmin section
    if (pathname.startsWith("/superadmin")) {
      if (!token) {
        // unauthenticated → login
        return NextResponse.redirect(new URL("/manage/login", req.url));
      }
      if (!token.isSuperAdmin) {
        return deny("requires-superadmin");
      }
    }

    // Manage section (excluding login handled above)
    if (pathname.startsWith("/manage")) {
      if (!token) {
        return NextResponse.redirect(new URL("/manage/login", req.url));
      }
      if (!token.isAdmin) {
        return deny("requires-admin");
      }
    }

    // API namespaces (already matched by config) fallback checks
    if (pathname.startsWith("/api/superadmin")) {
      if (!token?.isSuperAdmin) return deny("requires-superadmin");
    }
    if (pathname.startsWith("/api/admin")) {
      if (!token?.isAdmin) return deny("requires-admin");
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Defer detailed logic to middleware above; just allow so we can examine token there.
        return true; // We handle redirects/denials manually.
      },
    },
  },
);

// Matcher configuration - ORS routes are explicitly excluded BOTH in matcher AND in function
// CRITICAL: ORS routes must NEVER be protected - they use their own token-based auth
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - ORS (ORS API - explicitly excluded - NEVER protected)
     * - ors (lowercase variant - NEVER protected)
     */
    "/((?!_next/static|_next/image|favicon.ico|public/|ORS|ors|api/health).*)",
    "/manage/:path*",
    "/api/admin/:path*",
    "/superadmin/:path*",
    "/api/superadmin/:path*",
    // IMPORTANT: /ORS routes are NOT listed here - they bypass ALL auth
    // DO NOT add /ORS/:path* or /ors/:path* to this matcher
  ],
};
