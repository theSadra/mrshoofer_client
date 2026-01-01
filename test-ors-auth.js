// Test script to verify ORS authentication
const API_KEY = "YJure760oRHOgR0YAGOOGO1233211yMMB9R0my7cLtNOlscPgMLazgZCQhVy6";

console.log("ORS API Key for authentication:");
console.log(API_KEY);
console.log("\nUse this in your request header:");
console.log("Authorization: Bearer " + API_KEY);
console.log("\nOr directly:");
console.log("Authorization: " + API_KEY);
console.log("\n\nExample curl command:");
console.log(`curl -X POST http://localhost:3000/ORS/api/trip \\
  -H "Content-Type: application/json" \\
  -H "Authorization: ${API_KEY}" \\
  -d '{"passenger":{"NumberPhone":"09123456789","Firstname":"Test","Lastname":"User"},"trip":{"Pickup":"Tehran","Dropoff":"Karaj","TripDate":"2026-01-01T10:00:00"}}'`);
