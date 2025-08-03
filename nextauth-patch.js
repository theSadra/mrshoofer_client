// EMERGENCY PATCH FOR NEXTAUTH
// This file will be copied into node_modules/next-auth to force the secret to work

// Force NextAuth to accept our hardcoded secret
const HARDCODED_SECRET = 'vK8mN2pQ7rS9tU6wX3yZ5aB8cE1fH4iL7oP0qR3sT6uV9xA2bD5gJ8kM1nQ4rU7w';

// This will be used to patch the NextAuth library at build time
module.exports = {
  forceSecret: HARDCODED_SECRET
};
