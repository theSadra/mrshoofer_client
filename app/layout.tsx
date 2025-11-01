// removed 'use client' - root layout should be Server Component
import React, { ReactNode } from "react";
import "@/styles/globals.css";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "./providers";

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
            <main className="container p-1 mx-auto pt-4  xl:px-1 flex-grow">
              {children}
            </main>
            <footer
              className="w-full flex items-center justify-center py-5 mt-5"
              style={{ zIndex: 1 }}
            >
              <img
                alt="mrshoofer"
                className="h-5 w-auto object-contain mx-1"
                src="/mrshoofer_logo_full.png"
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
    url: "https://mrshoofer.com",
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
