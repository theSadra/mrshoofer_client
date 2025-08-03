// EMERGENCY FIX FOR NEXTAUTH
// This is a patched version of the NextAuth configuration that works 100% in production

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

// HARDCODED SECRET - DO NOT REMOVE OR MODIFY
const HARDCODED_SECRET = "vK8mN2pQ7rS9tU6wX3yZ5aB8cE1fH4iL7oP0qR3sT6uV9xA2bD5gJ8kM1nQ4rU7w";

// Force the environment variable to be set directly
if (!process.env.NEXTAUTH_SECRET) {
  console.log("⚠️ NEXTAUTH_SECRET not found in environment, setting it directly");
  process.env.NEXTAUTH_SECRET = HARDCODED_SECRET;
}
if (!process.env.NEXTAUTH_URL) {
  console.log("⚠️ NEXTAUTH_URL not found in environment, setting it directly");
  process.env.NEXTAUTH_URL = "https://mrshoofer-client.liara.run";
}

console.log("🔐 NEXTAUTH CONFIGURATION");
console.log("✅ Secret is available:", process.env.NEXTAUTH_SECRET ? "YES" : "NO");
console.log("✅ URL is set to:", process.env.NEXTAUTH_URL);

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  debug: true, // Enable debug mode
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "ایمیل", type: "text", placeholder: "admin@example.com" },
        password: { label: "رمز عبور", type: "password" },
      },
      async authorize(credentials: Record<string, string> | undefined) {
        try {
          console.log("🔐 Login attempt for:", credentials?.username);

          // Validate that both username and password are provided
          if (!credentials?.username || !credentials?.password) {
            console.log("❌ Missing username or password");
            return null;
          }

          // Trim whitespace
          const username = credentials.username.trim();
          const password = credentials.password.trim();

          if (!username || !password) {
            console.log("❌ Empty username or password after trimming");
            return null;
          }

          // Try to find user by email first
          let user = await prisma.user.findUnique({
            where: { email: username }
          });

          // If not found by email, try by name
          if (!user) {
            user = await prisma.user.findFirst({
              where: { name: username }
            });
          }

          if (!user) {
            console.log("❌ User not found in database:", username);
            return null;
          }

          if (!user.password) {
            console.log("❌ User has no password set");
            return null;
          }

          // Check if user is admin
          if (!user.isAdmin) {
            console.log("❌ User is not admin:", username);
            return null;
          }

          // Simple raw password comparison (no hashing)
          if (password !== user.password) {
            console.log("❌ Invalid password for:", username);
            console.log("🔍 Expected:", user.password);
            console.log("🔍 Received:", password);
            return null;
          }

          console.log("✅ Login successful for admin:", user.email);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
          };
        } catch (error) {
          console.error("🚨 Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 60 * 60 * 24 * 365 * 10, // 10 years in seconds
    updateAge: 60 * 60 * 24 * 365 * 10, // 10 years in seconds (optional, disables forced refresh)
  },
  pages: {
    signIn: "/manage/login",
  },
  callbacks: {
    async session({ session, token, user }: { session: any; token: any; user: any }) {
      if (session.user && token) {
        session.user.id = token.sub;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async signIn({ user }: { user: any }) {
      // Only allow sign in if user exists and is admin
      if (!user) {
        console.log("❌ SignIn callback: No user");
        return false;
      }

      if (!user.isAdmin) {
        console.log("❌ SignIn callback: User is not admin");
        return false;
      }

      console.log("✅ SignIn callback: Allowing admin login for", user.email);
      return true;
    },
  },
  events: {
    async signIn({ user }: { user: any }) {
      // Add logging logic here if needed
      console.log(`Admin login: ${user.email}`);
    },
  },
  // EXPLICITLY HARDCODED SECRET - DO NOT MODIFY
  secret: HARDCODED_SECRET,
  // Add this for production
  ...(process.env.NODE_ENV === 'production' && {
    useSecureCookies: true,
    cookies: {
      sessionToken: {
        name: `__Secure-next-auth.session-token`,
        options: {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: true,
        },
      },
    },
  }),
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
