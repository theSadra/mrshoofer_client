"use client";

import React, { ReactNode } from "react";

import { TripProvider } from "@/contexts/TripContext";

/**
 * Shared layout for trip-related flows (onboarding + location picker)
 * This ensures both routes share the same TripContext instance
 */
export default function TripFlowLayout({ children }: { children: ReactNode }) {
  return <TripProvider>{children}</TripProvider>;
}
