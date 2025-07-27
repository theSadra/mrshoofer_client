#!/bin/bash
# Generate a secure NextAuth secret
# Run this command and use the output as NEXTAUTH_SECRET

openssl rand -base64 32

# Alternative using Node.js:
# node -p "require('crypto').randomBytes(32).toString('base64')"
