// A valid React component for Next.js loading state
export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <img
        alt="MrShoofer Logo"
        className="mb-4"
        height={70}
        src="/mrshoofer_logo_full.png"
        width={120}
      />
      <span className="text-lg font-bold mb-2">در حال بارگذاری...</span>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
    </div>
  );
}
