import { NextRequest, NextResponse } from "next/server";

// Test endpoint to check environment variables
export async function GET(req: NextRequest) {
    const apiSecret = process.env.ORS_API_SECRET;
    const auth = req.headers.get("authorization");

    return NextResponse.json({
        message: "ORS API Test Endpoint",
        hasOrsSecret: !!apiSecret,
        secretLength: apiSecret ? apiSecret.length : 0,
        receivedAuth: !!auth,
        authValue: auth,
        environment: process.env.NODE_ENV
    });
}

// Test with authentication
export async function POST(req: NextRequest) {
    const apiSecret = process.env.ORS_API_SECRET;
    const auth = req.headers.get("authorization");

    if (!auth || !apiSecret) {
        return NextResponse.json({
            error: "Missing or invalid token",
            hasOrsSecret: !!apiSecret,
            receivedAuth: !!auth,
            authValue: auth
        }, { status: 401 });
    }

    const token = auth.startsWith("Bearer ") ? auth.replace("Bearer ", "") : auth;
    const isValid = token === apiSecret;

    return NextResponse.json({
        message: "Authentication test",
        isValid,
        tokenMatch: token === apiSecret,
        expectedLength: apiSecret.length,
        receivedLength: token.length
    });
}
