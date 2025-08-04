# Simplest Docker approach to fix both environment and dependency issues
FROM node:20-alpine

# Set only NODE_ENV, no secrets in ENV
ENV NODE_ENV=production

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Remove postinstall script
RUN sed -i '/postinstall/d' package.json

# Install dependencies WITH the legacy-peer-deps flag to fix React 19 compatibility
RUN npm install --legacy-peer-deps

# Copy the application
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

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
