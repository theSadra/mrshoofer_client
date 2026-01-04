import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";













node verify-ors-unprotected.jsWrite-Host "🧪 Testing..." -ForegroundColor YellowStart-Sleep -Seconds 10Write-Host "`n✅ Deployed! Waiting 10 seconds...`n" -ForegroundColor Greenliara deploy --app mrshoofer-client --port 3000Write-Host "Deploying directly to Liara..." -ForegroundColor Yellow# Option 1: Direct Liara deploy (faster, no Docker Hub needed)Set-Location "c:\Users\doros\OneDrive\Desktop\MrShoofer client webapp\mrshoofer_client"import { isPublicRoute } from "@/lib/public-routes";

/**
 * CRITICAL MIDDLEWARE CONFIGURATION
 * =================================
 * This middleware handles authentication for protected routes.
 * ORS routes MUST be completely bypassed - they use their own token auth.
 *
 * Protection Strategy (Multiple Layers):
 * 1. Centralized public route checker
 * 2. Case-insensitive ORS path check
 * 3. Explicit /ORS/ and /ors/ prefix check
 * 4. Matcher pattern exclusion
 * 5. Route-level configuration
 */

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // === LAYER 1: Centralized Public Routes ===
  if (isPublicRoute(pathname)) {
    console.log(`[Middleware] ✅ PUBLIC ROUTE: ${pathname}`);
    const response = NextResponse.next();
    response.headers.set('X-Public-Route', 'true');
    response.headers.set('X-ORS-Bypass', 'true');
    return response;
  }

  // === LAYER 2: Case-Insensitive ORS Check ===
  const pathLower = pathname.toLowerCase();
  if (pathLower.startsWith("/ors")) {
    console.log(`[Middleware] ✅ ORS ROUTE (case-insensitive): ${pathname}`);
    const response = NextResponse.next();
    response.headers.set('X-ORS-Bypass', 'true');
    return response;
  }

  // === LAYER 3: Explicit Path Prefix Check ===
  if (pathname.startsWith("/ORS/") || pathname.startsWith("/ors/") || pathname === "/ORS" || pathname === "/ors") {
    console.log(`[Middleware] ✅ ORS API: ${pathname}`);
    const response = NextResponse.next();
    response.headers.set('X-ORS-Bypass', 'true');
    return response;
  }

  // === PROTECTED ROUTES: Use NextAuth ===
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
