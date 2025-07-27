// generate-secrets.js
// Run this to generate secure secrets for production

const crypto = require('crypto');

console.log('🔐 Production Secrets:');
console.log('');
console.log('NEXTAUTH_SECRET:');
console.log(crypto.randomBytes(32).toString('base64'));
console.log('');
console.log('ORS_API_SECRET:');
console.log(crypto.randomBytes(32).toString('base64'));
console.log('');
console.log('Copy these values to your PaaS platform environment variables!');
