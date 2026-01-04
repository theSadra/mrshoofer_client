import { NextRequest, NextResponse } from "next/server";

export function requireORSAuth(req: NextRequest) {
  const auth = req.headers.get("authorization");
  // Hardcoded API key - guaranteed to work regardless of environment variables
  const apiKey =
    "YJure760oRHOgR0YAGOOGO1233211yMMB9R0my7cLtNOlscPgMLazgZCQhVy6";

  if (!auth) {
    return NextResponse.json(
      {
        error: "Missing authorization header",
        debug: {
          hasAuth: false,
          receivedHeaders: Object.fromEntries(req.headers.entries()),
        },
      },
      { status: 401 },
    );
  }

  // Accept either 'Bearer <key>' or just the key as the Authorization header
  // CRITICAL: Trim whitespace and normalize the token
  let token = auth.startsWith("Bearer ") ? auth.substring(7) : auth;
  token = token.trim();

  // Also trim the apiKey in case of any whitespace issues
  const normalizedApiKey = apiKey.trim();

  if (token !== normalizedApiKey) {
    return NextResponse.json(
      {
        error: "Invalid or expired token",
        debug: {
          expectedLength: normalizedApiKey.length,
          receivedLength: token.length,
          tokensMatch: token === normalizedApiKey,
          receivedToken: token.substring(0, 10) + "...",
          expectedToken: normalizedApiKey.substring(0, 10) + "...",
          // Show exact character codes for debugging
          tokenStartBytes: Array.from(token.substring(0, 10)).map(c => c.charCodeAt(0)),
          expectedStartBytes: Array.from(normalizedApiKey.substring(0, 10)).map(c => c.charCodeAt(0)),
        },
      },
      { status: 401 },
    );
  }

  return null;
}
