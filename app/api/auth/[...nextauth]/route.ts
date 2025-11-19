import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";

import prisma from "@/lib/prisma";

// DOCKER FIX: Ensure secret is always available
const SECRET =
  process.env.NEXTAUTH_SECRET ||
  "vK8mN2pQ7rS9tU6wX3yZ5aB8cE1fH4iL7oP0qR3sT6uV9xA2bD5gJ8kM1nQ4rU7w";

// Force the secret to be available for NextAuth
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = SECRET;
}

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  secret: SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "ایمیل",
          type: "text",
          placeholder: "admin@example.com",
        },
        password: { label: "رمز عبور", type: "password" },
      },
      async authorize(credentials: Record<string, string> | undefined) {
        try {
          // Validate that both username and password are provided
          if (!credentials?.username || !credentials?.password) {
            return null;
          }

          // Trim whitespace
          const username = credentials.username.trim();
          const password = credentials.password.trim();

          if (!username || !password) {
            return null;
          }

          // Try to find user by email first
          let user = await prisma.user.findUnique({
            where: { email: username },
          });

          // If not found by email, try by name
          if (!user) {
            user = await prisma.user.findFirst({
              where: { name: username },
            });
          }

          if (!user) {
            return null;
          }

          if (!user.password) {
            return null;
          }

          // Check if user is admin
          if (!user.isAdmin) {
            return null;
          }

          // Simple raw password comparison (no hashing)
          if (password !== user.password) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            // Cast for forward-compatibility; field will exist after migration
            isSuperAdmin: (user as any).isSuperAdmin,
          };
        } catch (error) {
          console.error("Authentication error:", error);

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
    async session({
      session,
      token,
      user,
    }: {
      session: any;
      token: any;
      user: any;
    }) {
      if (session.user && token) {
        session.user.id = token.sub;
        session.user.isAdmin = token.isAdmin;
        session.user.isSuperAdmin = token.isSuperAdmin;
      }

      return session;
    },
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.isAdmin = user.isAdmin;
        token.isSuperAdmin = user.isSuperAdmin;
      }

      return token;
    },
    async signIn({ user }: { user: any }) {
      // Only allow sign in if user exists and is admin
      if (!user) {
        return false;
      }

      if (!user.isAdmin) {
        return false;
      }

      return true;
    },
  },
  events: {
    async signIn({ user }: { user: any }) {
      // Add logging logic here if needed
      console.log(`Admin login: ${user.email}`);
    },
  },
  // Add this for production
  ...(process.env.NODE_ENV === "production" && {
    useSecureCookies: true,
    cookies: {
      sessionToken: {
        name: `__Secure-next-auth.session-token`,
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: true,
        },
      },
    },
  }),
};

// Use NextAuth with explicit authOptions
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
