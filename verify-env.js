// verify-env.js - Script to verify environment variables are accessible

console.log("Environment Variable Check:");
console.log("---------------------------");
console.log("NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET);
console.log("NEXTAUTH_SECRET length:", process.env.NEXTAUTH_SECRET ? process.env.NEXTAUTH_SECRET.length : 0);
console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("---------------------------");

// Attempt to read from .env file
const fs = require('fs');
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  console.log(".env file exists and contains:", envContent.split('\n').length, "lines");
} catch (err) {
  console.log(".env file could not be read:", err.message);
}

console.log("---------------------------");
console.log("If NEXTAUTH_SECRET exists and has length, environment variables are configured correctly.");
