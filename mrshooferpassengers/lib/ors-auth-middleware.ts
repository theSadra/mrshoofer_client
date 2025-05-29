import { NextRequest, NextResponse } from "next/server";

export function requireORSAuth(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const apiKey = process.env.ORS_API_SECRET;
  if (!auth || !apiKey) {
    return NextResponse.json({ error: "Missing or invalid token" }, { status: 401 });
  }
  // Accept either 'Bearer <key>' or just the key as the Authorization header
  const token = auth.startsWith("Bearer ") ? auth.replace("Bearer ", "") : auth;
  if (token !== apiKey) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
  return null;
}
