// Special patch file to guarantee NextAuth has access to its secret
// Store this in lib/force-nextauth-secret.js

// Force environment variables for NextAuth
process.env.NEXTAUTH_SECRET = "vK8mN2pQ7rS9tU6wX3yZ5aB8cE1fH4iL7oP0qR3sT6uV9xA2bD5gJ8kM1nQ4rU7w";
process.env.NEXTAUTH_URL = "https://mrshoofer-client.liara.run";

// Export the secret for direct use
module.exports = {
  NEXTAUTH_SECRET: "vK8mN2pQ7rS9tU6wX3yZ5aB8cE1fH4iL7oP0qR3sT6uV9xA2bD5gJ8kM1nQ4rU7w"
};
