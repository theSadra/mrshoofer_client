import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
I 
// Securely load secrets based on environment
const SECRET = process.env.NEXTAUTH_SECRET;
// Removed default fallback for production security

console.log("🔐 NextAuth - Secret set:", !!SECRET);

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  secret: SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials?.password) return null;
          
          const username = credentials.username.trim();
          const password = credentials.password.trim();
          
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: username },
                { name: username }
              ]
            }
          });
          
          if (!user || !user.isAdmin || user.password !== password) return null;
          
          return { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            isAdmin: true 
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const, // Explicitly cast to 'const' for type compatibility
    maxAge: 60 * 60 * 24 * 365 * 10
  },
  pages: { 
    signIn: "/manage/login" 
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.isAdmin = user.isAdmin;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    },
    async signIn({ user }) {
      return !!(user && user.isAdmin);
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
