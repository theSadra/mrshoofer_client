"use client";
import React from "react";

// This layout is now only a passthrough for /manage, not for protected pages
export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
