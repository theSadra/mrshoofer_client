// This file will be prepended to the server.js file
// to ensure environment variables are set before Next.js initializes

// Set critical environment variables if not already set
if (!process.env.NEXTAUTH_SECRET) {
  console.log('⚠️ NEXTAUTH_SECRET not found in environment, using hardcoded value');
  process.env.NEXTAUTH_SECRET = 'vK8mN2pQ7rS9tU6wX3yZ5aB8cE1fH4iL7oP0qR3sT6uV9xA2bD5gJ8kM1nQ4rU7w';
}

if (!process.env.NEXTAUTH_URL) {
  console.log('⚠️ NEXTAUTH_URL not found in environment, using hardcoded value');
  process.env.NEXTAUTH_URL = 'https://mrshoofer-client.liara.run';
}

if (!process.env.ORS_API_SECRET) {
  console.log('⚠️ ORS_API_SECRET not found in environment, using hardcoded value');
  process.env.ORS_API_SECRET = 'YJure760oRHOgR0YAGOOGO1233211yMMB9R0my7cLtNOlscPgMLazgZCQhVy6';
}

if (!process.env.SMSIR_API_KEY) {
  console.log('⚠️ SMSIR_API_KEY not found in environment, using hardcoded value');
  process.env.SMSIR_API_KEY = 'YJure760oRHOgR01yMMB9R0my7cLtNOlscPgMLazgZCQhVy6';
}

console.log('✅ Environment variables set by server-env.js');
