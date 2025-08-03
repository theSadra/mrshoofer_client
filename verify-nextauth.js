// verify-nextauth.js - Advanced verification script for NextAuth environment
// Run this with: node verify-nextauth.js

const fs = require('fs');
const path = require('path');

// Color coding for terminal output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m"
};

console.log(`${colors.cyan}=============================================${colors.reset}`);
console.log(`${colors.cyan}  NextAuth Environment Verification Tool     ${colors.reset}`);
console.log(`${colors.cyan}=============================================${colors.reset}`);

// 1. Check for environment variables
const requiredEnvVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

const optionalEnvVars = [
  'ORS_API_SECRET',
  'SMSIR_API_KEY',
  'APP_BASE_URL',
  'DATABASE_URL'
];

console.log(`\n${colors.magenta}Checking environment variables:${colors.reset}`);
let envProblems = false;

requiredEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`${colors.green}✓ ${varName}: FOUND${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ ${varName}: MISSING (REQUIRED)${colors.reset}`);
    envProblems = true;
  }
});

optionalEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`${colors.green}✓ ${varName}: FOUND${colors.reset}`);
  } else {
    console.log(`${colors.yellow}! ${varName}: MISSING (OPTIONAL)${colors.reset}`);
  }
});

// 2. Check for .env files
console.log(`\n${colors.magenta}Checking environment files:${colors.reset}`);
const envFiles = ['.env', '.env.local', '.env.production', '.env.production.local'];
let fileProblems = false;

envFiles.forEach(filename => {
  try {
    const content = fs.readFileSync(filename, 'utf8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    if (lines.length > 0) {
      console.log(`${colors.green}✓ ${filename}: FOUND (${lines.length} variables)${colors.reset}`);
      
      // Check for required variables in this file
      let missingInFile = [];
      requiredEnvVars.forEach(varName => {
        if (!content.includes(`${varName}=`)) {
          missingInFile.push(varName);
        }
      });
      
      if (missingInFile.length > 0) {
        console.log(`  ${colors.yellow}! Missing in ${filename}: ${missingInFile.join(', ')}${colors.reset}`);
      }
    } else {
      console.log(`${colors.yellow}! ${filename}: EMPTY${colors.reset}`);
      fileProblems = true;
    }
  } catch (err) {
    console.log(`${colors.yellow}! ${filename}: NOT FOUND (${err.code})${colors.reset}`);
    fileProblems = true;
  }
});

// 3. Check for NextAuth.js module
console.log(`\n${colors.magenta}Checking NextAuth installation:${colors.reset}`);
try {
  const nextAuthPath = require.resolve('next-auth');
  console.log(`${colors.green}✓ next-auth: INSTALLED at ${nextAuthPath}${colors.reset}`);
  
  // Try to require NextAuth
  try {
    const NextAuth = require('next-auth');
    console.log(`${colors.green}✓ next-auth: IMPORTED SUCCESSFULLY${colors.reset}`);
  } catch (err) {
    console.log(`${colors.red}✗ next-auth: FAILED TO IMPORT: ${err.message}${colors.reset}`);
  }
  
} catch (err) {
  console.log(`${colors.red}✗ next-auth: NOT FOUND. Error: ${err.message}${colors.reset}`);
}

// 4. Provide summary
console.log(`\n${colors.magenta}Environment Verification Summary:${colors.reset}`);
if (!envProblems && !fileProblems) {
  console.log(`${colors.green}All checks passed! NextAuth environment appears to be correctly configured.${colors.reset}`);
} else {
  console.log(`${colors.yellow}Some issues were detected that might cause NextAuth problems:${colors.reset}`);
  if (envProblems) {
    console.log(`${colors.yellow}- Missing required environment variables${colors.reset}`);
  }
  if (fileProblems) {
    console.log(`${colors.yellow}- Issues with environment files${colors.reset}`);
  }
  
  console.log(`\n${colors.cyan}Recommended fixes:${colors.reset}`);
  console.log(`1. Ensure NEXTAUTH_SECRET and NEXTAUTH_URL are set in your environment`);
  console.log(`2. Create .env and .env.local files with these variables`);
  console.log(`3. Verify that your Docker container has access to these variables`);
  console.log(`4. Check that NextAuth is properly installed and configured`);
}

console.log(`\n${colors.cyan}=============================================${colors.reset}`);
