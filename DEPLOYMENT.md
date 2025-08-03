# MrShoofer Client Webapp

## Environment Setup

### Required Environment Variables

The application requires these environment variables to function properly:

- `NEXTAUTH_SECRET` - Required for NextAuth.js authentication
- `NEXTAUTH_URL` - The base URL of your deployed application (e.g., https://mrshoofer-client.liara.run)
- `ORS_API_SECRET` - API secret for ORS services
- `SMSIR_API_KEY` - API key for SMS.ir integration
- `APP_BASE_URL` - Base URL for the application
- `DATABASE_URL` - PostgreSQL connection string

### Development Setup

1. Create a `.env.local` file in the root directory with the required environment variables
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```
4. Run development server:
   ```bash
   npm run dev
   ```

### Production Build

Use our Docker image for production deployment:

```bash
# Build the Docker image
docker build -t mrshoofer-client -f Dockerfile.fixed2 .

# Run the container
docker run -p 3000:3000 mrshoofer-client
```

## Troubleshooting

### NextAuth "NO_SECRET" Error

If you encounter a "NO_SECRET" error in production, ensure:

1. `NEXTAUTH_SECRET` is correctly set in your environment
2. The Docker container has access to this environment variable
3. NextAuth.js is correctly configured

You can verify your environment with:

```bash
node verify-nextauth.js
```

### Prisma Generation Issues

If Prisma generation fails during Docker build:

1. Ensure Prisma is installed before running generate
2. Modify package.json to remove postinstall script if needed
3. Run Prisma generate manually after dependencies are installed

## Deployment

This project is configured for deployment with GitHub Actions. The workflow automatically builds and pushes the Docker image to Docker Hub on commits to main/master branches.

To deploy manually:

1. Run the pre-build script:
   ```bash
   ./pre-build.sh
   ```
2. Build and push the Docker image:
   ```bash
   docker build -t your-username/mrshoofer-client:latest -f Dockerfile.fixed2 .
   docker push your-username/mrshoofer-client:latest
   ```

## Environment Variables in Production

For maximum reliability, the application sets environment variables in multiple places:

1. Docker ENV directives
2. .env files (created at build time)
3. Runtime environment variables (set via start script)

This redundancy ensures NextAuth and other services always have access to required configuration.
