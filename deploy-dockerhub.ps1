# MrShoofer Docker Hub Deployment Script
# Builds and pushes to Docker Hub with latest tag, then triggers Liara deployment

Write-Host "🚀 Starting MrShoofer Docker Hub Deployment" -ForegroundColor Green

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "❌ Not in a git repository" -ForegroundColor Red
    exit 1
}

# Get the current commit hash for tagging
try {
    $commitHash = git rev-parse --short HEAD
    Write-Host "📝 Current commit: $commitHash" -ForegroundColor Cyan
} catch {
    $commitHash = "unknown"
}

# Build timestamp for unique tagging
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

# Docker image names
$dockerUsername = "thesadra"  # Replace with your Docker Hub username
$imageName = "$dockerUsername/mrshoofer-client"
$latestTag = "${imageName}:latest"
$timestampTag = "${imageName}:${timestamp}"
$commitTag = "${imageName}:${commitHash}"

Write-Host "🏗️ Building Docker image..." -ForegroundColor Yellow
Write-Host "Tags to create:" -ForegroundColor Cyan
Write-Host "  - $latestTag" -ForegroundColor White
Write-Host "  - $timestampTag" -ForegroundColor White  
Write-Host "  - $commitTag" -ForegroundColor White

# Build the Docker image with multiple tags
docker build -t $latestTag -t $timestampTag -t $commitTag .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker build failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker image built successfully" -ForegroundColor Green

# Push to Docker Hub
Write-Host "📤 Pushing to Docker Hub..." -ForegroundColor Yellow

Write-Host "Pushing latest tag..." -ForegroundColor Cyan
docker push $latestTag

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push latest tag" -ForegroundColor Red
    exit 1
}

Write-Host "Pushing timestamp tag..." -ForegroundColor Cyan
docker push $timestampTag

Write-Host "Pushing commit tag..." -ForegroundColor Cyan
docker push $commitTag

Write-Host "✅ All images pushed to Docker Hub successfully" -ForegroundColor Green

Write-Host ""
Write-Host "🌐 Deployment Information:" -ForegroundColor Yellow
Write-Host "Docker Hub Repository: $imageName" -ForegroundColor White
Write-Host "Latest Tag: $latestTag" -ForegroundColor White
Write-Host "Build Timestamp: $timestamp" -ForegroundColor White
Write-Host "Commit Hash: $commitHash" -ForegroundColor White

Write-Host ""
Write-Host "📋 Next Steps for Liara:" -ForegroundColor Yellow
Write-Host "1. Go to your Liara dashboard" -ForegroundColor White
Write-Host "2. Select your mrshoofer-client app" -ForegroundColor White
Write-Host "3. Go to Deploy section" -ForegroundColor White
Write-Host "4. Trigger a new deployment" -ForegroundColor White
Write-Host "5. Liara will pull the latest image from Docker Hub" -ForegroundColor White

Write-Host ""
Write-Host "🎉 Docker Hub deployment complete!" -ForegroundColor Green
Write-Host "Your latest code with all driver assignment fixes is now available at:" -ForegroundColor Green
Write-Host "$latestTag" -ForegroundColor Cyan
