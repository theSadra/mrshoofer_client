import React, { ReactNode } from "react";

// Layout for location selector pages - no footer
export default function LocationLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {children}
    </div>
  );
}
