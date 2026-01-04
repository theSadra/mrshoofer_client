/**
 * Public API routes configuration
 * These routes must NEVER be protected by any middleware
 */

export const PUBLIC_API_ROUTES = [
  '/ORS',
  '/ors',
  '/api/health',
  '/_next',
  '/public',
];

export function isPublicRoute(pathname: string): boolean {
  const lowerPath = pathname.toLowerCase();
  return PUBLIC_API_ROUTES.some(route => 
    lowerPath.startsWith(route.toLowerCase())
  );
}
