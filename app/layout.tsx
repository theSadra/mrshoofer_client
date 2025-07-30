// removed 'use client' - root layout must be a Server Component
import React, { ReactNode } from "react";
import "@/styles/globals.css";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "./providers";

import { fontSans } from "@/config/fonts";
import ClientNavbarWrapper from "@/components/ClientNavbarWrapper";


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={clsx(
        "min-h-screen bg-background font-sans antialiased",
        fontSans.variable
      )}>
        <Providers themeProps={{ 
          attribute: "class", 
          defaultTheme: "light", 
          forcedTheme: "light",
          enableSystem: false,
          enableColorScheme: false 
        }}>
          <div className="relative flex flex-col h-screen">
            {/* <ClientNavbarWrapper /> */}
            <main className="container mx-auto max-w-7xl pt-4 px-3.5 flex-grow">
              {children}
            </main>
            <footer className="w-full flex items-center justify-center py-5 mt-5">
              <img
                src="/mrshoofer_logo_full.png"
                alt="mrshoofer"
                className="h-5 w-auto object-contain mx-1"
              />
              <Link
                isExternal
                className="flex items-center gap-1 text-current"
                href="https://heroui.com?utm_source=next-app-template"
                title="heroui.com homepage"
              >
                <p className="text-primary text-xs font-light">همیشه با شما</p>
              </Link>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
