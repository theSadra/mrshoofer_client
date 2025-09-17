"use client";
import React from "react";

import Layout from "../components/App";
import AuthGuard from "../components/AuthGuard";

export default function ProtectedManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex items-center justify-center bg-background">
        <div className="lg:container sm:mx-0 sm:px-1 mx-auto w-full md:px-0 ">
          <Layout>{children}</Layout>
        </div>
      </div>
    </AuthGuard>
  );
}
