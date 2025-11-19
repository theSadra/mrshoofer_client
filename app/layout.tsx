// removed 'use client' - root layout should be Server Component
import React, { ReactNode } from "react";
import "@/styles/globals.css";
import clsx from "clsx";

import { Providers } from "./providers";
import AppFooter from "@/components/layout/AppFooter";

import { fontSans, fontMono } from "@/config/fonts";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning dir="rtl" lang="fa">
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontMono.variable,
        )}
      >
        <Providers
          themeProps={{
            attribute: "class",
            defaultTheme: "light",
            forcedTheme: "light",
            enableSystem: false,
            enableColorScheme: false,
          }}
        >
          <div className="relative flex flex-col h-screen">
            {/* <ClientNavbarWrapper /> */}
            <main className="container p-1 mx-auto pt-0 sm:px-0 xl:px-1 flex-grow">
              {children}
            </main>
            <AppFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}

// Metadata for the app
export const metadata = {
  title: {
    default: "MrShoofer",
    template: "%s - MrShoofer",
  },
  description: "درخواست تاکسی آنلاین",
  keywords: ["MrShoofer", "تاکسی", "درخواست تاکسی"],
  authors: [
    {
      name: "MrShoofer",
    },
  ],
  creator: "MrShoofer",
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: "https://mrshoofer.ir",
    title: "MrShoofer",
    description: "درخواست تاکسی آنلاین",
    siteName: "MrShoofer",
  },
  twitter: {
    card: "summary_large_image",
    title: "MrShoofer",
    description: "درخواست تاکسی آنلاین",
    creator: "@mrshoofer",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};
