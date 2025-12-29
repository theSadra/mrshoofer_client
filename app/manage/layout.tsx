"use client";
import React from "react";
import { AuthInterceptor } from "./components/AuthInterceptor";

// This layout is now only a passthrough for /manage, not for protected pages
export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthInterceptor />
      {children}
    </>
  );
}
