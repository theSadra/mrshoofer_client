// This file will be used in the Docker container to force environment variables
console.log('🚀 Starting server with hardcoded environment variables');

// Set critical environment variables before loading server.js
process.env.NEXTAUTH_SECRET = 'vK8mN2pQ7rS9tU6wX3yZ5aB8cE1fH4iL7oP0qR3sT6uV9xA2bD5gJ8kM1nQ4rU7w';
process.env.NEXTAUTH_URL = 'https://mrshoofer-client.liara.run';
process.env.ORS_API_SECRET = 'YJure760oRHOgR0YAGOOGO1233211yMMB9R0my7cLtNOlscPgMLazgZCQhVy6';
process.env.SMSIR_API_KEY = 'YJure760oRHOgR01yMMB9R0my7cLtNOlscPgMLazgZCQhVy6';

console.log('✅ Environment variables set directly in server-wrapper.js');
console.log('🔐 NEXTAUTH_SECRET: ' + process.env.NEXTAUTH_SECRET.substring(0, 10) + '...');
console.log('🔗 NEXTAUTH_URL: ' + process.env.NEXTAUTH_URL);

// Create a custom server.js file
const fs = require('fs');
const path = require('path');

try {
  // We don't need to modify server.js, just execute it directly
  require('./server.js');
} catch (error) {
  console.error('❌ Error running server.js:', error);
  process.exit(1);
}
