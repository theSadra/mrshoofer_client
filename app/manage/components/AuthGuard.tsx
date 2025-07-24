"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/manage/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="text-center p-4">در حال بارگذاری...</div>;
  }

  return <>{children}</>;
}
