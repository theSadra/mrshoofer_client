#!/bin/bash
# Script to prepare the Docker build by copying the Docker-optimized auth route
# Create this file in the repository root and run it before building the Docker image

# Copy the Docker-optimized NextAuth route file
cp ./app/api/auth/\[\...nextauth\]/route.docker.ts ./app/api/auth/\[\...nextauth\]/route.ts

echo "✅ Copied Docker-optimized NextAuth route file."
echo "🔐 Ready to build Docker image with properly configured authentication."
