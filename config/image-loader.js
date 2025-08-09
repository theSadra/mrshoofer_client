// Custom image loader for Next.js
const imageLoader = ({ src, width, quality }) => {
  // For local images starting with /, return as-is
  if (src.startsWith('/')) {
    return src;
  }
  
  // For relative paths, add leading slash
  if (!src.startsWith('http')) {
    return `/${src}`;
  }
  
  // For external images, return as-is
  return src;
};

export default imageLoader;
