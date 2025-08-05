# Production deployment script for MrShoofer
# This script builds a new Docker image and forces Liara to use the latest version

Write-Host "🚀 MrShoofer Production Deployment Started" -ForegroundColor Green

# Check if Docker is running
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running or installed" -ForegroundColor Red
    exit 1
}

# Build timestamp for unique tagging
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$imageTag = "mrshoofer-client:$timestamp"
$latestTag = "mrshoofer-client:latest"

Write-Host "🔨 Building Docker image with tag: $imageTag" -ForegroundColor Yellow

# Build the Docker image with new optimized Dockerfile
docker build -t $imageTag -t $latestTag .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker image built successfully" -ForegroundColor Green

# Optional: Push to Docker Hub (uncomment if using Docker Hub)
# Write-Host "📤 Pushing to Docker Hub..." -ForegroundColor Yellow
# docker push $imageTag
# docker push $latestTag

Write-Host "🌐 Image ready for deployment to Liara" -ForegroundColor Green
Write-Host "Image tags created:" -ForegroundColor Cyan
Write-Host "  - $imageTag" -ForegroundColor Cyan
Write-Host "  - $latestTag" -ForegroundColor Cyan

Write-Host "" 
Write-Host "Next steps for Liara deployment:" -ForegroundColor Yellow
Write-Host "1. Push your code changes to your Git repository" -ForegroundColor White
Write-Host "2. Liara will automatically build and deploy the new Docker image" -ForegroundColor White
Write-Host "3. Or manually trigger deployment in Liara dashboard" -ForegroundColor White

Write-Host ""
Write-Host "🎉 Deployment preparation complete!" -ForegroundColor Green
