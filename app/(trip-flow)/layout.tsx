"use client";

import React, { ReactNode } from "react";

import { TripProvider } from "@/contexts/TripContext";

/**
 * Shared layout for trip-related flows (onboarding + location picker)
 * This ensures both routes share the same TripContext instance
 * 
 * IMPORTANT: This must remain a client component to ensure proper hydration
 * of the TripProvider in production builds
 */
export default function TripFlowLayout({ children }: { children: ReactNode }) {
  // Wrap in React.Fragment to ensure clean hydration boundary
  return (
    <React.Fragment>
      <TripProvider>{children}</TripProvider>
    </React.Fragment>
  );
}
