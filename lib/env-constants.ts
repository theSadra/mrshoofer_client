// This file ensures environment variables are available in all environments
// with hardcoded fallbacks for production reliability

// NextAuth
export const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "vK8mN2pQ7rS9tU6wX3yZ5aB8cE1fH4iL7oP0qR3sT6uV9xA2bD5gJ8kM1nQ4rU7w";
export const NEXTAUTH_URL = process.env.NEXTAUTH_URL || "https://mrshoofer-client.liara.run";

// API Keys
export const ORS_API_SECRET = process.env.ORS_API_SECRET || "YJure760oRHOgR0YAGOOGO1233211yMMB9R0my7cLtNOlscPgMLazgZCQhVy6";
export const SMSIR_API_KEY = process.env.SMSIR_API_KEY || "YJure760oRHOgR01yMMB9R0my7cLtNOlscPgMLazgZCQhVy6";
export const APP_BASE_URL = process.env.APP_BASE_URL || "https://webapp.mrshoofer.ir";

// Database
export const DATABASE_URL = process.env.DATABASE_URL || "postgresql://root:X7pGrkczSStKTxuyw1dH9WxE@mrshoofer-client-db:5432/postgres";

// Node environment
export const NODE_ENV = process.env.NODE_ENV || "production";
