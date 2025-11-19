"use client";

import { useEffect, useState } from "react";
import AppNavbar from "@/app/components/AppNavbar";
import { TripProvider } from "@/app/contexts/TripContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <>
        <AppNavbar />
        <main className="pt-4">
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        </main>
      </>
    );
  }

  return (
    <TripProvider>
      <AppNavbar />
      <main className="pt-4">{children}</main>
    </TripProvider>
  );
}
