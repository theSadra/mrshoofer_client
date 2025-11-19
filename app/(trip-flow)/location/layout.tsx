import React, { ReactNode } from "react";

/**
 * Layout for location picker - fullscreen map without footer
 * TripProvider is inherited from parent (trip-flow) layout
 */
export default function LocationLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full h-screen overflow-hidden">{children}</div>
  );
}
