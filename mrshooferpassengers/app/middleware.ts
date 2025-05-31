import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
        return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }
    return NextResponse.next();
}

export const config = {
    matcher: "/manage/api/:path*",
};
