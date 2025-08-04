# Script to prepare the Docker build by copying the Docker-optimized auth route
# Create this file in the repository root and run it before building the Docker image

# Copy the Docker-optimized NextAuth route file
Copy-Item -Path ".\app\api\auth\[...nextauth]\route.docker.ts" -Destination ".\app\api\auth\[...nextauth]\route.ts" -Force

Write-Host "✅ Copied Docker-optimized NextAuth route file."
Write-Host "🔐 Ready to build Docker image with properly configured authentication."
