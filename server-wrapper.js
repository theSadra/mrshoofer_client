// This file will be used in the Docker container to force environment variables

// Set critical environment variables before loading server.js
process.env.NEXTAUTH_SECRET = 'vK8mN2pQ7rS9tU6wX3yZ5aB8cE1fH4iL7oP0qR3sT6uV9xA2bD5gJ8kM1nQ4rU7w';
process.env.NEXTAUTH_URL = 'https://mrshoofer-client.liara.run';
process.env.ORS_API_SECRET = 'YJure760oRHOgR0YAGOOGO1233211yMMB9R0my7cLtNOlscPgMLazgZCQhVy6';
process.env.SMSIR_API_KEY = 'YJure760oRHOgR01yMMB9R0my7cLtNOlscPgMLazgZCQhVy6';

console.log('🔐 NextAuth secret and environment variables set directly in server wrapper');

// Now load the actual server
require('./server.js');
