import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token as any;
    const isApi = pathname.startsWith("/api/");

    // CRITICAL: Allow ALL /ORS routes to bypass authentication completely
    if (pathname.startsWith("/ORS")) {
      console.log(`[Middleware] Allowing ORS route: ${pathname}`);
      return NextResponse.next();
    }

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

// Matcher intentionally does NOT include /api/:path* to avoid blocking public API routes like /ORS/api/trip
// The middleware explicitly checks and allows /ORS/* routes at the very beginning
export const config = {
  matcher: [
    "/manage/:path*",
    "/api/admin/:path*",
    "/superadmin/:path*",
    "/api/superadmin/:path*",
    // /ORS/* routes are explicitly allowed in middleware, no need to list here
  ],
};
