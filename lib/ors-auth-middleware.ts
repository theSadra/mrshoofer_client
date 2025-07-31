import { NextRequest, NextResponse } from "next/server";

export function requireORSAuth(req: NextRequest) {
  const auth = req.headers.get("authorization");
  // Hardcoded API key as fallback since env vars aren't working in production
  const apiKey = process.env.ORS_API_SECRET || "YJure760oRHOgR0YAGOOGO1233211yMMB9R0my7cLtNOlscPgMLazgZCQhVy6";
  
  if (!auth || !apiKey) {
    return NextResponse.json({ 
      error: "Missing or invalid token",
      debug: {
        hasAuth: !!auth,
        hasApiKey: !!apiKey,
        authValue: auth
      }
    }, { status: 401 });
  }
  
  // Accept either 'Bearer <key>' or just the key as the Authorization header
  const token = auth.startsWith("Bearer ") ? auth.replace("Bearer ", "") : auth;
  
  if (token !== apiKey) {
    return NextResponse.json({ 
      error: "Invalid or expired token",
      debug: {
        expectedLength: apiKey.length,
        receivedLength: token.length,
        tokensMatch: token === apiKey
      }
    }, { status: 401 });
  }
  
  return null;
}
