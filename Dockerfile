# Next.js + Prisma Production Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
# Remove postinstall script to prevent early Prisma generation
RUN sed -i '/postinstall/d' package.json
RUN npm ci --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables for Prisma schema
ENV DATABASE_PROVIDER="postgresql"
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

# Generate Prisma client for build
RUN npx prisma generate

# Build Next.js application (skip prisma:deploy, just build)
RUN npm run build:fast

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Disable Next.js telemetry during runtime
ENV NEXT_TELEMETRY_DISABLED=1

# Create nextjs user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the public folder from builder stage
COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema for runtime generation
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Create startup script for Prisma + Next.js
RUN echo '#!/bin/sh\n\
    echo "🔧 Generating Prisma client with production database..."\n\
    npx prisma generate\n\
    echo "� Running database migrations..."\n\
    npx prisma migrate deploy || echo "⚠️ Migration failed or no migrations to run"\n\
    echo "🚀 Starting Next.js application..."\n\
    exec node server.js\n\
    ' > start.sh && chmod +x start.sh && chown nextjs:nodejs start.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./start.sh"]
