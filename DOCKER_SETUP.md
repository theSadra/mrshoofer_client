# 🚀 MrShoofer Client - GitHub Actions + Docker Hub Setup

## 📋 Setup Instructions:

### 1. Docker Hub Setup:
1. Go to [hub.docker.com](https://hub.docker.com) and create account
2. Create new repository: `thesadra/mrshoofer-client` (public)
3. Go to Account Settings → Security → New Access Token
4. Copy the access token

### 2. GitHub Secrets Setup:
1. Go to your GitHub repo: Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add these secrets:
   - Name: `DOCKER_HUB_USERNAME` Value: `thesadra`
   - Name: `DOCKER_HUB_ACCESS_TOKEN` Value: `your_access_token_here`

### 3. How it works:
- 🔄 Push code to GitHub → Triggers GitHub Actions
- 🔨 GitHub Actions builds Docker image automatically
- 📦 Pushes image to Docker Hub: `thesadra/mrshoofer-client:latest`
- ⚡ Deploy with `liara deploy` → Super fast (30 seconds!)

### 4. Deploy Commands:
```bash
# Push to GitHub (triggers auto-build)
git add .
git commit -m "Update app"
git push

# Wait for GitHub Actions to complete (5-10 minutes)
# Then deploy to Liara (30 seconds)
liara deploy
```

### 5. Monitor Build:
- GitHub repo → Actions tab → Watch build progress
- Docker Hub → Repositories → thesadra/mrshoofer-client → See new images

## 🎯 Benefits:
✅ No more 20-minute timeout issues
✅ Fast deployments (30 seconds)
✅ Automatic builds on every push
✅ Version history and rollbacks
✅ Professional CI/CD pipeline
