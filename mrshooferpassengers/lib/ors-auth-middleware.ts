import { NextRequest, NextResponse } from "next/server";
import { verifyORSJWT } from "@/lib/ors-jwt";

export function requireORSAuth(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing or invalid token" }, { status: 401 });
  }
  const token = auth.replace("Bearer ", "");
  if (!verifyORSJWT(token)) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
  return null;
}
