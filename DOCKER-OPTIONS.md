# Docker Deployment Options

This document lists all the available Docker deployment options for this project.

## Available Dockerfiles

1. **Dockerfile.compatible** (Recommended)
   - Uses standard `npm install` instead of `npm ci`
   - Removes postinstall script with `sed` for maximum compatibility
   - Sets environment variables in multiple places
   - Creates a startup script for runtime environment

2. **Dockerfile.simple-working**
   - Simple approach with minimal complexity
   - Uses `npm ci --legacy-peer-deps` for installation
   - Removes postinstall script with npm pkg delete
   - Generates Prisma client after all dependencies are installed

3. **Dockerfile.minimal**
   - Absolute minimum configuration focused on making it work
   - Copies all files at once for simplicity
   - Removes postinstall script to prevent premature Prisma generation
   - Uses direct npm start command

4. **Dockerfile.super-minimal**
   - The simplest possible configuration
   - Only includes essential environment variables
   - Single command for install, generate and build
   - Focuses on minimal steps and maximum compatibility

## How to Use

Update the GitHub workflow file to use your preferred Dockerfile:

```yaml
- name: Build and push Docker image
  uses: docker/build-push-action@v5
  with:
    context: .
    file: ./Dockerfile.compatible  # Change this to your preferred Dockerfile
    push: true
    tags: ${{ steps.meta.outputs.tags }}
    labels: ${{ steps.meta.outputs.labels }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
    platforms: linux/amd64
    no-cache: true
```

## Troubleshooting

If you encounter issues with Prisma client generation:

1. Ensure the postinstall script is removed before npm install
2. Generate Prisma client manually after all dependencies are installed
3. Try using standard `npm install` instead of `npm ci` if problems persist

For NextAuth "NO_SECRET" errors:

1. Ensure environment variables are set in the Dockerfile
2. Create .env files with the necessary variables
3. Use a startup script to set environment variables at runtime
