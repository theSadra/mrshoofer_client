"use client";

import React from "react";

import AppLayout from "../components/App";

export default function UpcomingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
