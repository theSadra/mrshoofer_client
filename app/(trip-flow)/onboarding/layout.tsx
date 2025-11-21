"use client";

import React, { ReactNode } from "react";
import { TripProvider } from "../trip-context";


export default function OnboardingLayout({ children }: { children: ReactNode }) {
  console.log("OnboardingLayout: Rendering with TripProvider");
  return <TripProvider>{children}</TripProvider>;
}
