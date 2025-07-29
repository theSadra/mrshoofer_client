# 🚀 Complete CI/CD Pipeline: GitHub → Docker Hub → Liara

## 📋 Overview

Your GitHub Actions workflow now supports **full automation**:

1. **GitHub Push** → 
2. **Build Docker Image** → 
3. **Push to Docker Hub** → 
4. **Auto-Deploy to Liara** 🎉

## 🔑 Required Liara API Setup

### Step 1: Get Liara API Token

1. Go to [Liara Dashboard](https://console.liara.ir)
2. Click on your **Profile** (top right)
3. Go to **API Tokens**
4. Click **Generate New Token**
5. **Name**: `GitHub Actions CI/CD`
6. **Permissions**: `Project Management`
7. **Copy the token** (save it securely!)

### Step 2: Get Your Project ID

1. In Liara Dashboard, go to your **mrshoofer-client** project
2. In the URL, copy the project name/ID
3. Example: `https://console.liara.ir/projects/mrshoofer-client`
4. Project ID = `mrshoofer-client`

### Step 3: Add GitHub Secrets

Add these **3 new secrets** to your GitHub repository:

| Secret Name | Value | Where to Get |
|-------------|-------|--------------|
| `LIARA_API_TOKEN` | `lrn_xxx...` | From Liara API Tokens |
| `LIARA_PROJECT_ID` | `mrshoofer-client` | From your project URL |
| `DOCKER_HUB_USERNAME` | `sadradorostkar` | ✅ Already added |
| `DOCKER_HUB_ACCESS_TOKEN` | `dckr_pat_xxx...` | ✅ Already added |

**To add secrets:**
1. Go to GitHub: `https://github.com/theSadra/mrshoofer_client`
2. **Settings** → **Secrets and variables** → **Actions**
3. **New repository secret**

## 🎯 How the Complete Pipeline Works

### **Trigger: Push to `main` branch**

```bash
git add .
git commit -m "Add new feature"
git push origin main
```

### **Automatic Process:**

1. **🔄 GitHub Actions Starts**
   - Triggers on push to `main`
   - Runs on Ubuntu runners

2. **🔨 Build Phase**
   - Builds Docker image using `Dockerfile.optimized`
   - Tags: `latest`, `stable`, `main-<commit-sha>`
   - Uses build cache for speed

3. **📦 Push to Docker Hub**
   - Pushes to `sadradorostkar/mrshoofer-client`
   - Multiple tags for flexibility

4. **🚀 Deploy to Liara** (NEW!)
   - Calls Liara API automatically
   - Triggers deployment with latest image
   - Only runs on `main` branch pushes

5. **✅ Live Application**
   - Your app updates automatically
   - Zero downtime deployment
   - Database migrations run on startup

## 📊 Deployment Conditions

The Liara deployment **only runs when**:
- ✅ Push is to `main` branch
- ✅ Event is a direct push (not PR)
- ✅ Docker build was successful
- ✅ All secrets are configured

**Pull Requests** will only build and test, **not deploy**.

## 🔍 Monitoring Your Pipeline

### **GitHub Actions Dashboard:**
- Go to your repo → **Actions** tab
- See real-time build progress
- View logs for each step

### **Docker Hub:**
- Check `sadradorostkar/mrshoofer-client`
- See new tags after each build

### **Liara Dashboard:**
- View deployment logs
- Monitor application status
- Check resource usage

## 🚨 Troubleshooting

### **Common Issues:**

1. **Liara API Error 401 (Unauthorized)**
   ```bash
   Solution: Check LIARA_API_TOKEN is correct
   ```

2. **Liara API Error 404 (Project Not Found)**
   ```bash
   Solution: Verify LIARA_PROJECT_ID matches your project name
   ```

3. **Deployment Doesn't Trigger**
   ```bash
   Solution: Ensure push is to 'main' branch, not 'master' or feature branch
   ```

4. **Docker Image Not Found**
   ```bash
   Solution: Wait for Docker Hub push to complete before Liara deployment
   ```

## 🎉 Testing Your Complete Pipeline

### **First Deployment Test:**

1. **Add all GitHub secrets** (4 total)
2. **Make a small change** to your code
3. **Push to main:**
   ```bash
   git add .
   git commit -m "Test complete CI/CD pipeline"
   git push origin main
   ```
4. **Watch the magic happen:**
   - GitHub Actions builds → 
   - Docker Hub receives image → 
   - Liara automatically deploys → 
   - Your app is live! 🎉

### **Expected Timeline:**
- **Build & Push**: ~5-10 minutes
- **Liara Deployment**: ~2-5 minutes
- **Total**: ~7-15 minutes from push to live

## 🔄 Alternative: Manual Liara Deploy

If you prefer manual control, you can also trigger deployments manually:

```bash
# Install Liara CLI
npm install -g @liara/cli

# Login to Liara
liara login

# Deploy manually
liara deploy --image sadradorostkar/mrshoofer-client:latest
```

## 🎯 Benefits of This Setup

- ✅ **Zero Manual Work**: Push code → Live application
- ✅ **Fast Deployments**: Pre-built images deploy quickly
- ✅ **Reliable**: Tested builds before deployment
- ✅ **Rollback Ready**: Tagged images for easy rollbacks
- ✅ **Professional**: Enterprise-grade CI/CD pipeline

---

**Your complete automation is ready! Push to `main` and watch your app deploy automatically!** 🚀🎉
