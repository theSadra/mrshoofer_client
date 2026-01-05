import { NextRequest, NextResponse } from "next/server";

// Route configuration - ensure this route is completely public and never cached
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Debug endpoint to troubleshoot Partner API routes and middleware
// GET /api/partner/debug
export async function GET(req: NextRequest) {
  const headers = Object.fromEntries(req.headers.entries());
  const url = new URL(req.url);

  return NextResponse.json({
    message: "ORS Debug Endpoint - No Auth Required",
    timestamp: new Date().toISOString(),
    url: {
      full: req.url,
      pathname: url.pathname,
      search: url.search,
      origin: url.origin,
    },
    headers: {
      all: headers,
      authorization: headers.authorization || null,
      host: headers.host,
      userAgent: headers["user-agent"],
      contentType: headers["content-type"],
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      hasOrsSecret: !!process.env.ORS_API_SECRET,
      secretLength: process.env.ORS_API_SECRET?.length || 0,
    },
    request: {
      method: req.method,
      nextUrl: req.nextUrl.pathname,
    },
    middlewareStatus: "This endpoint should bypass all middleware",
  });
}

// POST /api/partner/debug - Echo back the request body for testing
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const headers = Object.fromEntries(req.headers.entries());

    return NextResponse.json({
      message: "ORS Debug Endpoint - POST Echo",
      timestamp: new Date().toISOString(),
      receivedBody: body,
      headers: {
        authorization: headers.authorization || null,
        contentType: headers["content-type"],
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to parse request body",
        message: error.message,
      },
      { status: 400 }
    );
  }
}
