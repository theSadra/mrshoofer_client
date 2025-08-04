# Simplest Docker approach to fix both environment and dependency issues
FROM node:20-alpine

# Set only NODE_ENV, no secrets in ENV
ENV NODE_ENV=production

WORKDIR /app

# Create production environment files with hardcoded secrets
RUN echo "NODE_ENV=production" > .env.production && \
    echo "NEXTAUTH_SECRET=vK8mN2pQ7rS9tU6wX3yZ5aB8cE1fH4iL7oP0qR3sT6uV9xA2bD5gJ8kM1nQ4rU7w" >> .env.production && \
    echo "NEXTAUTH_URL=https://mrshoofer-client.liara.run" >> .env.production && \
    echo "ORS_API_SECRET=YJure760oRHOgR0YAGOOGO1233211yMMB9R0my7cLtNOlscPgMLazgZCQhVy6" >> .env.production && \
    echo "SMSIR_API_KEY=YJure760oRHOgR01yMMB9R0my7cLtNOlscPgMLazgZCQhVy6" >> .env.production && \
    echo "APP_BASE_URL=https://webapp.mrshoofer.ir" >> .env.production && \
    echo "DATABASE_URL=postgresql://root:X7pGrkczSStKTxuyw1dH9WxE@mrshoofer-client-db:5432/postgres" >> .env.production && \
    cp .env.production .env && \
    cp .env.production .env.local

# Copy package files
COPY package.json package-lock.json ./

# Remove postinstall script
RUN sed -i '/postinstall/d' package.json

# Install dependencies WITH the legacy-peer-deps flag to fix React 19 compatibility
# This single command installs ALL dependencies including Prisma - DO NOT install Prisma separately
RUN npm install --legacy-peer-deps

# Copy the application
COPY . .

# Replace NextAuth route with production version that reads from .env files
RUN echo 'import NextAuth from "next-auth";\n\
    import CredentialsProvider from "next-auth/providers/credentials";\n\
    import { PrismaAdapter } from "@next-auth/prisma-adapter";\n\
    import prisma from "@/lib/prisma";\n\
    \n\
    // Production secret - reads from .env files or falls back to hardcoded value\n\
    const SECRET = process.env.NEXTAUTH_SECRET || "vK8mN2pQ7rS9tU6wX3yZ5aB8cE1fH4iL7oP0qR3sT6uV9xA2bD5gJ8kM1nQ4rU7w";\n\
    \n\
    // Ensure the secret is available\n\
    if (!process.env.NEXTAUTH_SECRET) {\n\
    process.env.NEXTAUTH_SECRET = SECRET;\n\
    }\n\
    \n\
    console.log("🔐 Production Auth Config - Secret available:", !!SECRET);\n\
    console.log("🔐 NEXTAUTH_URL:", process.env.NEXTAUTH_URL);\n\
    # Environment variables should be provided at runtime by your deployment platform (Liara, Docker Compose, etc.)
    # If you need to bake a non-secret .env file, use COPY .env.production .env.production

    \n\
    RUN echo "NODE_ENV=production" > .env.production && \
    cp .env.production .env && \
    cp .env.production .env.local
},\n\
    async authorize(credentials) {\n\
    try {\n\
    if (!credentials?.username || !credentials?.password) return null;\n\
    const username = credentials.username.trim();\n\
    const password = credentials.password.trim();\n\
    if (!username || !password) return null;\n\
    let user = await prisma.user.findUnique({ where: { email: username } });\n\
    if (!user) user = await prisma.user.findFirst({ where: { name: username } });\n\
    if (!user || !user.password || !user.isAdmin || password !== user.password) return null;\n\
    return { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin };\n\
    } catch (error) {\n\
    console.error("Auth error:", error);\n\
    return null;\n\
    }\n\
    },\n\
    }),\n\
    ],\n\
    session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 365 * 10 },\n\
    pages: { signIn: "/manage/login" },\n\
    callbacks: {\n\
    async session({ session, token }) {\n\
    if (session.user && token) {\n\
    session.user.id = token.sub;\n\
    session.user.isAdmin = token.isAdmin;\n\
    }\n\
    return session;\n\
    },\n\
    async jwt({ token, user }) {\n\
    if (user) token.isAdmin = user.isAdmin;\n\
    return token;\n\
    },\n\
    async signIn({ user }) {\n\
    return !!(user && user.isAdmin);\n\
    },\n\
    },\n\
    };\n\
    \n\
    const handler = NextAuth(authOptions);\n\
    export { handler as GET, handler as POST };\n\
    ' > /app/app/api/auth/\[...nextauth\]/route.ts

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Create startup script that just starts the app (secrets are in .env files)
RUN echo '#!/bin/sh\n\
    echo "🚀 Starting MrShoofer application..."\n\
    echo "Environment files ready with production secrets"\n\
    exec npm start\n\
    ' > start.sh

# Make executable
RUN chmod +x start.sh

# Expose port
EXPOSE 3000

# Start the application
CMD ["./start.sh"]
