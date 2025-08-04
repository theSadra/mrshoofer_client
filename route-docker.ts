import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

// HARDCODED SECRET FOR DOCKER
const SECRET = "vK8mN2pQ7rS9tU6wX3yZ5aB8cE1fH4iL7oP0qR3sT6uV9xA2bD5gJ8kM1nQ4rU7w";
process.env.NEXTAUTH_SECRET = SECRET;

console.log("🔐 Docker NextAuth - Secret set:", !!SECRET);

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
    strategy: "jwt",
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
