# 🐳 MrShoofer - Containerized Deployment Guide

## 📋 Overview

This Next.js application is fully containerized and ready for PaaS deployment. It includes:

- ✅ **Optimized Multi-stage Dockerfile**
- ✅ **Docker Compose for local development**
- ✅ **Production-ready configuration**
- ✅ **Database migrations handling**
- ✅ **Health checks**
- ✅ **PaaS platform configurations**

## 🚀 **Why Containerization is Excellent for PaaS**

### **✅ Benefits:**

1. **Consistency**: Same environment locally and in production
2. **Isolation**: Dependencies are contained and controlled
3. **Scalability**: Easy horizontal scaling on PaaS platforms
4. **Portability**: Deploy anywhere Docker runs
5. **Version Control**: Docker images are versioned
6. **Resource Efficiency**: Optimized image size and memory usage

### **✅ Perfect for PaaS Platforms:**

- **Liara** 🇮🇷 (Automated CI/CD with GitHub Actions)
- **Railway** ⭐ (Excellent Docker support)
- **Render** ⭐ (Native Docker deployment)
- **Google Cloud Run** ⭐ (Serverless containers)
- **AWS App Runner** ⭐ (Container-based deployment)
- **DigitalOcean App Platform** (Docker support)
- **Heroku** (Container Registry)

## 🛠️ **Local Development**

### **Prerequisites:**
- Docker & Docker Compose installed
- Node.js 18+ (for local development)

### **Quick Start:**

```bash
# Clone and setup
git clone <your-repo>
cd mrshoofer_client

# Start with Docker (includes PostgreSQL)
npm run docker:dev

# View logs
npm run docker:logs

# Stop services
npm run docker:stop
```

The app will be available at: `http://localhost:3000`

## 🌐 **Production Deployment**

### **Option 1: Liara with Full CI/CD (Recommended) 🇮🇷**

**Complete automation**: GitHub → Docker Hub → Liara

1. **Setup GitHub Secrets:** (See `LIARA_CICD_SETUP.md`)
   - `DOCKER_HUB_USERNAME` ✅
   - `DOCKER_HUB_ACCESS_TOKEN` ✅  
   - `LIARA_API_TOKEN` (Get from Liara Dashboard)
   - `LIARA_PROJECT_ID` (Your project name)

2. **Deploy by pushing to main:**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

3. **Automatic process:**
   - GitHub Actions builds Docker image
   - Pushes to Docker Hub
   - Triggers Liara deployment
   - Your app goes live! 🎉

### **Option 2: Railway 🚂**

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy:**
   ```bash
   # Windows
   ./scripts/deploy-railway.bat
   
   # Linux/Mac
   ./scripts/deploy-railway.sh
   ```

3. **Set Environment Variables in Railway Dashboard:**
   ```env
   DATABASE_URL=postgresql://user:pass@host:5432/db
   NEXTAUTH_SECRET=your-32-character-secret
   NEXTAUTH_URL=https://your-app.railway.app
   SMSIR_API_KEY=your-sms-key
   NEXT_PUBLIC_NESHAN_MAP_KEY=your-map-key
   NEXT_PUBLIC_NESHAN_API_KEY=your-api-key
   APP_BASE_URL=https://your-app.railway.app
   ORS_API_SECRET=your-ors-secret
   ```

### **Option 2: Google Cloud Run 🌤️**

```bash
# Build and push to Google Container Registry
docker build -t gcr.io/YOUR_PROJECT_ID/mrshoofer-app .
docker push gcr.io/YOUR_PROJECT_ID/mrshoofer-app

# Deploy to Cloud Run
gcloud run deploy mrshoofer-app \
  --image gcr.io/YOUR_PROJECT_ID/mrshoofer-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### **Option 3: Render 🎨**

1. Connect your GitHub repository
2. Choose "Web Service"
3. Set Docker as build method
4. Configure environment variables
5. Deploy!

## 🗃️ **Database Setup**

### **For Production:**

1. **PostgreSQL** (Recommended):
   - Railway: Add PostgreSQL service
   - Google Cloud: Cloud SQL
   - Supabase: Managed PostgreSQL

2. **Get Connection String:**
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
   ```

## 🔧 **Environment Variables**

### **Required Variables:**

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `NEXTAUTH_SECRET` | 32+ character secret | Generate with crypto |
| `NEXTAUTH_URL` | Your app's URL | `https://your-app.com` |
| `SMSIR_API_KEY` | SMS service key | From SMS.ir dashboard |
| `NEXT_PUBLIC_NESHAN_MAP_KEY` | Neshan map key | From Neshan portal |
| `NEXT_PUBLIC_NESHAN_API_KEY` | Neshan API key | From Neshan portal |
| `APP_BASE_URL` | Base URL for app | `https://your-app.com` |
| `ORS_API_SECRET` | ORS authentication | Generate secure string |

### **Generate Secrets:**

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Or use online generator
# https://generate-secret.vercel.app/32
```

## 🏥 **Health Checks**

The application includes health check endpoints:

- **Health Check:** `/api/health`
- **Status:** Returns 200 for healthy, 503 for unhealthy

## 📊 **Monitoring & Logs**

### **Local:**
```bash
# View application logs
docker-compose logs -f app

# View database logs
docker-compose logs -f postgres
```

### **Production:**
- Railway: Built-in logging dashboard
- Google Cloud Run: Cloud Logging
- Render: Application logs in dashboard

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **Build fails:**
   ```bash
   # Clean Docker cache
   docker system prune -f
   npm run docker:clean
   ```

2. **Database connection fails:**
   - Check `DATABASE_URL` format
   - Ensure PostgreSQL is accessible
   - Verify credentials

3. **Migration issues:**
   ```bash
   # Reset migrations
   docker-compose exec app npx prisma migrate reset
   docker-compose exec app npx prisma migrate deploy
   ```

## 📈 **Scaling**

The containerized setup supports:

- **Horizontal scaling**: Multiple container instances
- **Load balancing**: Behind PaaS load balancers
- **Resource limits**: CPU/Memory configuration
- **Auto-scaling**: Based on traffic (platform dependent)

## 🎯 **Best Practices Implemented**

- ✅ Multi-stage Docker builds (smaller image size)
- ✅ Non-root user for security
- ✅ Health checks for reliability
- ✅ Environment-based configuration
- ✅ Database migration handling
- ✅ Optimized for PaaS deployment
- ✅ Production-ready logging
- ✅ Resource efficiency

---

**Ready to deploy? Your containerized Next.js app is optimized for PaaS platforms!** 🚀
