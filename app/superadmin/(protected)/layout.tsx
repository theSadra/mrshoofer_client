"use client";
import React from "react";
import Layout from "../../manage/components/App";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

function SuperAdminGuard({ children }) {
  const { status } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/manage/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="p-4 text-center">در حال بارگذاری...</div>;
  }

  return <>{children}</>;
}

export default function ProtectedSuperAdminLayout({ children }) {
  return (
    <SuperAdminGuard>
      <div className="flex items-center justify-center bg-background">
        <div className="lg:container sm:mx-0 sm:px-1 mx-auto w-full md:px-0 ">
          <Layout>{children}</Layout>
        </div>
      </div>
    </SuperAdminGuard>
  );
}
