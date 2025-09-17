"use client";
import { Link } from "@heroui/link";
import clsx from "clsx";

import { Providers } from "./providers";

import { fontSans } from "@/config/fonts";
import ClientNavbarWrapper from "@/components/ClientNavbarWrapper";

export default function ClientRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
        dir="rtl"
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          <div className="relative flex flex-col h-screen">
            <ClientNavbarWrapper />
            <main className="container mx-auto max-w-7xl pt-4 px-3.5 flex-grow">
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
