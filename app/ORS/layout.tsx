// This layout ensures ORS routes are completely public and bypass all authentication
export const runtime = 'nodejs';

export default function ORSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
