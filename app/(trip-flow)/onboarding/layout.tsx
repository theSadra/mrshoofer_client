"use client";

import React, { ReactNode } from "react";
import { TripProvider } from "@/contexts/TripContext";

/**
 * Onboarding-specific layout that ensures TripProvider is always available
 * This is a fallback to ensure the provider works even if the parent layout has issues
 */
export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return <TripProvider>{children}</TripProvider>;
}
