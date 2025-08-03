// This file injects environment variables BEFORE anything else is loaded
console.log('🚀 Starting server with forced NextAuth secret');

// FORCE THE NEXTAUTH SECRET - This must be done before any modules are loaded
process.env.NEXTAUTH_SECRET = 'vK8mN2pQ7rS9tU6wX3yZ5aB8cE1fH4iL7oP0qR3sT6uV9xA2bD5gJ8kM1nQ4rU7w';
process.env.NEXTAUTH_URL = 'https://mrshoofer-client.liara.run';

// Set other environment variables
process.env.ORS_API_SECRET = 'YJure760oRHOgR0YAGOOGO1233211yMMB9R0my7cLtNOlscPgMLazgZCQhVy6';
process.env.SMSIR_API_KEY = 'YJure760oRHOgR01yMMB9R0my7cLtNOlscPgMLazgZCQhVy6';
process.env.APP_BASE_URL = 'https://webapp.mrshoofer.ir';
process.env.DATABASE_URL = 'postgresql://root:X7pGrkczSStKTxuyw1dH9WxE@mrshoofer-client-db:5432/postgres';

// Add a debug flag to see all env vars
process.env.NEXTAUTH_DEBUG = 'true';

// Print environment variables for debugging
console.log('✅ Critical environment variables set');
console.log('🔐 NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✓ SET' : '✗ MISSING');
console.log('🔗 NEXTAUTH_URL:', process.env.NEXTAUTH_URL);

// Create dummy .env.production file to ensure it exists
const fs = require('fs');
try {
  // Create a .env.production file in the current directory
  fs.writeFileSync('.env.production', `
NEXTAUTH_SECRET=vK8mN2pQ7rS9tU6wX3yZ5aB8cE1fH4iL7oP0qR3sT6uV9xA2bD5gJ8kM1nQ4rU7w
NEXTAUTH_URL=https://mrshoofer-client.liara.run
`);
  console.log('✅ Created .env.production file');
} catch (error) {
  console.error('❌ Error creating .env.production file:', error);
}

// Load the actual server
try {
  console.log('🚀 Loading server.js');
  require('./server.js');
} catch (error) {
  console.error('❌ Error running server.js:', error);
  process.exit(1);
}
