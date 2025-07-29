// Custom image loader for Next.js
const imageLoader = ({ src, width, quality }) => {
  // For local images, just return the src as-is
  if (src.startsWith('/')) {
    return src;
  }
  
  // For external images, return as-is
  return src;
};

module.exports = imageLoader;
