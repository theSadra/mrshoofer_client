import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
        const user = await prisma.user.findUnique({ where: { email: credentials.username } });
        if (!user || !user.password) return null;
        // Compare raw password (INSECURE, not recommended)
        if (credentials.password !== user.password) return null;
        if (!user.isAdmin) return null;
        return user;
      },
    }),
  ],
  session: { strategy: "jwt" as const },
  pages: {
    signIn: "/manage/login",
  },
  callbacks: {
    async session({ session, token, user }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
  },
  events: {
    async signIn({ user }) {
      // Add logging logic here if needed
      console.log(`Admin login: ${user.email}`);
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
