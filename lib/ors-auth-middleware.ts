import { NextRequest, NextResponse } from "next/server";

export function requireORSAuth(req: NextRequest) {
  const auth = req.headers.get("authorization");
  // Hardcoded API key - guaranteed to work regardless of environment variables
  const apiKey = "YJure760oRHOgR0YAGOOGO1233211yMMB9R0my7cLtNOlscPgMLazgZCQhVy6";
  
  if (!auth) {
    return NextResponse.json({ 
      error: "Missing authorization header",
      debug: {
        hasAuth: false,
        receivedHeaders: Object.fromEntries(req.headers.entries())
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
        tokensMatch: token === apiKey,
        receivedToken: token.substring(0, 10) + "...", // Only show first 10 chars for security
        expectedToken: apiKey.substring(0, 10) + "..."
      }
    }, { status: 401 });
  }
  
  return null;
}
