// EMERGENCY SERVER WRAPPER FOR NEXTAUTH
// This file directly forces the environment variables and loads the server

// Force critical environment variables 
process.env.NEXTAUTH_SECRET = 'vK8mN2pQ7rS9tU6wX3yZ5aB8cE1fH4iL7oP0qR3sT6uV9xA2bD5gJ8kM1nQ4rU7w';
process.env.NEXTAUTH_URL = 'https://mrshoofer-client.liara.run';
process.env.ORS_API_SECRET = 'YJure760oRHOgR0YAGOOGO1233211yMMB9R0my7cLtNOlscPgMLazgZCQhVy6';
process.env.SMSIR_API_KEY = 'YJure760oRHOgR01yMMB9R0my7cLtNOlscPgMLazgZCQhVy6';
process.env.APP_BASE_URL = 'https://webapp.mrshoofer.ir';
process.env.DATABASE_URL = 'postgresql://root:X7pGrkczSStKTxuyw1dH9WxE@mrshoofer-client-db:5432/postgres';

// Add debug flag
process.env.NEXTAUTH_DEBUG = 'true';

// Create .env file directly
const fs = require('fs');
try {
  fs.writeFileSync('.env', `
NEXTAUTH_SECRET=vK8mN2pQ7rS9tU6wX3yZ5aB8cE1fH4iL7oP0qR3sT6uV9xA2bD5gJ8kM1nQ4rU7w
NEXTAUTH_URL=https://mrshoofer-client.liara.run
`);
  fs.writeFileSync('.env.local', `
NEXTAUTH_SECRET=vK8mN2pQ7rS9tU6wX3yZ5aB8cE1fH4iL7oP0qR3sT6uV9xA2bD5gJ8kM1nQ4rU7w
NEXTAUTH_URL=https://mrshoofer-client.liara.run
`);
  fs.writeFileSync('.env.production', `
NEXTAUTH_SECRET=vK8mN2pQ7rS9tU6wX3yZ5aB8cE1fH4iL7oP0qR3sT6uV9xA2bD5gJ8kM1nQ4rU7w
NEXTAUTH_URL=https://mrshoofer-client.liara.run
`);
  console.log('✅ Created .env files');
} catch (error) {
  console.error('⚠️ Error creating .env files:', error);
}

// Log environment for debugging
console.log('🔧 ENVIRONMENT VARIABLES:');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✓ SET' : '✗ MISSING');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);

// Run the actual server
console.log('🚀 Starting Next.js server...');
require('./server.js');
