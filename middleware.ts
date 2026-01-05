import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";
import { isPublicRoute } from "@/lib/public-routes";

/**
 * ============================================================================
 * AUTHENTICATION MIDDLEWARE - TWO SEPARATE SYSTEMS
 * ============================================================================
 * 
 * SYSTEM 1: Partner API Authentication (Token-Based)
 * ------------------------------------------------
 * - Routes: /api/partner/*
 * - Auth Method: Bearer token in Authorization header
 * - Token: YJure760oRHOgR0YAGOOGO1233211yMMB9R0my7cLtNOlscPgMLazgZCQhVy6
 * - Handler: requireORSAuth() in each partner route
 * - NEVER uses NextAuth - completely bypassed
 * 
 * SYSTEM 2: Admin/Manage Authentication (Session-Based)
 * ------------------------------------------------------
 * - Routes: /manage/*, /superadmin/*, /api/admin/*, /api/superadmin/*
 * - Auth Method: NextAuth session cookies
 * - Handler: withAuth() middleware below
 * - NEVER applies to Partner API routes
 * 
 * ============================================================================
 */

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // =========================================================================
  // PARTNER API ROUTES: BYPASS ALL NEXTAUTH AUTHENTICATION
  // =========================================================================
  // These routes use their own Bearer token authentication system
  // They must NEVER be checked by NextAuth middleware
  
  // Check 1: Centralized public route checker
  if (isPublicRoute(pathname)) {
    console.log(`[Middleware] ✅ PUBLIC ROUTE - NO AUTH: ${pathname}`);
    const response = NextResponse.next();
    response.headers.set("X-Auth-System", "none");
    response.headers.set("X-ORS-Bypass", "true");
    return response;
  }

  // Check 2: Partner API routes
  if (pathname.startsWith("/api/partner")) {
    console.log(`[Middleware] ✅ PARTNER API - TOKEN AUTH (not NextAuth): ${pathname}`);
    const response = NextResponse.next();
    response.headers.set("X-Auth-System", "partner-token");
    response.headers.set("X-Partner-Bypass", "true");
    return response;
  }

  // Check 3: Explicit Partner API path check
  if (
    pathname.startsWith("/api/partner/") ||
    pathname === "/api/partner"
  ) {
    console.log(`[Middleware] ✅ PARTNER API - TOKEN AUTH (not NextAuth): ${pathname}`);
    const response = NextResponse.next();
    response.headers.set("X-Auth-System", "partner-token");
    response.headers.set("X-Partner-Bypass", "true");
    return response;
  }

  // =========================================================================
  // PROTECTED ROUTES: USE NEXTAUTH MIDDLEWARE
  // =========================================================================
  // Only /manage, /superadmin, /api/admin, /api/superadmin routes reach here
  // Partner API routes never get here - they returned early above
  
  console.log(`[Middleware] 🔐 Protected route - using NextAuth: ${pathname}`);
  return withAuthMiddleware(req);
}

// NextAuth middleware - ONLY for /manage, /superadmin, and admin API routes
// ORS routes NEVER execute this code
const withAuthMiddleware = withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token as any;
    const isApi = pathname.startsWith("/api/");

    // Helper to handle unauthorized consistently
    const deny = (reason: string) => {
      if (isApi) {
        return NextResponse.json(
          { error: "Forbidden", reason, authSystem: "nextauth" },
          { status: 403 }
        );
      }
      const url = new URL("/403", req.url);
      url.searchParams.set("r", pathname);
      return NextResponse.redirect(url);
    };

    // Public manage login always allowed
    if (pathname === "/manage/login") {
      return NextResponse.next();
    }

    // OTP request endpoint must stay public
    if (pathname === "/manage/api/auth/request-otp") {
      return NextResponse.next();
    }

    // Superadmin section - requires NextAuth session with isSuperAdmin
    if (pathname.startsWith("/superadmin")) {
      if (!token) {
        return NextResponse.redirect(new URL("/manage/login", req.url));
      }
      if (!token.isSuperAdmin) {
        return deny("requires-superadmin");
      }
    }

    // Manage section - requires NextAuth session with isAdmin
    if (pathname.startsWith("/manage")) {
      if (!token) {
        return NextResponse.redirect(new URL("/manage/login", req.url));
      }
      if (!token.isAdmin) {
        return deny("requires-admin");
      }
    }

    // API namespaces - requires NextAuth session
    if (pathname.startsWith("/api/superadmin")) {
      if (!token?.isSuperAdmin) {
        return deny("requires-superadmin");
      }
    }
    if (pathname.startsWith("/api/admin")) {
      if (!token?.isAdmin) {
        return deny("requires-admin");
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // We handle authorization logic in the middleware function above
        return true;
      },
    },
  }
);

// ============================================================================
// MATCHER CONFIGURATION
// ============================================================================
// Explicitly exclude ORS routes from even being considered by middleware
// This is a performance optimization - ORS routes return early anyway
export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder
     * - api/partner routes
     * - api/health (health check)
     */
    "/((?!_next/static|_next/image|favicon.ico|public/|api/partner|api/health).*)",
    // Explicitly match admin routes (will be checked by NextAuth)
    "/manage/:path*",
    "/api/admin/:path*",
    "/superadmin/:path*",
    "/api/superadmin/:path*",
  ],
};
