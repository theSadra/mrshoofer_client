import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "ایمیل", type: "text", placeholder: "admin@example.com" },
        password: { label: "رمز عبور", type: "password" },
      },
      async authorize(credentials: Record<string, string> | undefined) {
        if (!credentials?.username || !credentials?.password) return null;
        // Try username as email, fallback to name field
        let user = await prisma.user.findUnique({ where: { email: credentials.username } });
        if (!user && credentials.username) {
          user = await prisma.user.findFirst({ where: { name: credentials.username } });
        }
        if (!user || !user.password) return null;
        // Compare raw password (INSECURE, not recommended)
        if (credentials.password !== user.password) return null;
        if (!user.isAdmin) return null;
        return user;
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
      if (session.user) {
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
      // Add logging logic here if needed
      console.log(`Admin login: ${user.email}`);
      return true;
    },
  },
  events: {
    async signIn({ user }: { user: any }) {
      // Add logging logic here if needed
      console.log(`Admin login: ${user.email}`);
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
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
