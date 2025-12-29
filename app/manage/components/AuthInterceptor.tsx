"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function AuthInterceptor() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Store original fetch
    const originalFetch = window.fetch;

    // Override fetch to intercept 403 responses
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      // If 403 and we're in the manage section, redirect to login
      if (response.status === 403 && pathname?.startsWith("/manage")) {
        console.warn("403 Forbidden - Redirecting to login");
        router.push(`/manage/login?redirect=${encodeURIComponent(pathname)}`);
      }

      return response;
    };

    // Cleanup on unmount
    return () => {
      window.fetch = originalFetch;
    };
  }, [router, pathname]);

  return null;
}
