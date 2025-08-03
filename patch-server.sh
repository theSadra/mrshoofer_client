#!/bin/sh
# Patch server.js file with environment variables

# Make a backup of original server.js
cp server.js server.original.js

# Create a temporary file with environment variable declarations
cat > env-header.js << EOL
// Hardcoded environment variables for NextAuth
process.env.NEXTAUTH_SECRET = 'vK8mN2pQ7rS9tU6wX3yZ5aB8cE1fH4iL7oP0qR3sT6uV9xA2bD5gJ8kM1nQ4rU7w';
process.env.NEXTAUTH_URL = 'https://mrshoofer-client.liara.run';
process.env.ORS_API_SECRET = 'YJure760oRHOgR0YAGOOGO1233211yMMB9R0my7cLtNOlscPgMLazgZCQhVy6';
process.env.SMSIR_API_KEY = 'YJure760oRHOgR01yMMB9R0my7cLtNOlscPgMLazgZCQhVy6';
console.log('🔐 NextAuth secret forced by server patch');

EOL

# Combine env-header.js with original server.js
cat env-header.js server.original.js > server.js

# Clean up
rm env-header.js server.original.js

echo "✅ server.js patched with hardcoded environment variables"
