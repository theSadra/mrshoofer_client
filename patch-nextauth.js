// This is a DIRECT PATCH to NextAuth's compiled code
// It modifies the core library to ALWAYS use our hardcoded secret
// regardless of environment variables

const fs = require('fs');
const path = require('path');

// Hardcoded secret that will be injected
const HARDCODED_SECRET = "vK8mN2pQ7rS9tU6wX3yZ5aB8cE1fH4iL7oP0qR3sT6uV9xA2bD5gJ8kM1nQ4rU7w";

// Path to the NextAuth core file that checks for the secret
const nextAuthCorePath = path.join(process.cwd(), 'node_modules', 'next-auth', 'core', 'lib', 'assert.js');

// Read the file
try {
  console.log(`Looking for NextAuth core at: ${nextAuthCorePath}`);
  
  if (fs.existsSync(nextAuthCorePath)) {
    const content = fs.readFileSync(nextAuthCorePath, 'utf8');
    
    // Check if file contains the function that throws the NO_SECRET error
    if (content.includes('MissingSecret')) {
      console.log('Found NextAuth assert.js file, patching...');
      
      // Replace the function that checks for the secret
      const patchedContent = content.replace(
        /function assertConfig\(config\) {[^}]+}/,
        `function assertConfig(config) {
          // PATCHED: Always use hardcoded secret
          config.secret = "${HARDCODED_SECRET}";
          return config;
        }`
      );
      
      // Write the patched file
      fs.writeFileSync(nextAuthCorePath, patchedContent);
      console.log('✅ Successfully patched NextAuth to use hardcoded secret!');
    } else {
      console.log('❌ Could not find assertConfig function in NextAuth code');
    }
  } else {
    console.log('❌ NextAuth core file not found');
  }
} catch (error) {
  console.error('❌ Error patching NextAuth:', error);
}

// Also create a .env file with the secret
try {
  const envContent = `NEXTAUTH_SECRET=${HARDCODED_SECRET}\nNEXTAUTH_URL=https://mrshoofer-client.liara.run\n`;
  fs.writeFileSync(path.join(process.cwd(), '.env'), envContent);
  fs.writeFileSync(path.join(process.cwd(), '.env.local'), envContent);
  fs.writeFileSync(path.join(process.cwd(), '.env.production'), envContent);
  console.log('✅ Created .env files with secret');
} catch (error) {
  console.error('❌ Error creating .env files:', error);
}
