"use client";

import { Link } from "@heroui/link";
import { usePathname } from "next/navigation";

const FOOTERLESS_SEGMENTS = ["/onboarding"];

export default function AppFooter() {
  const pathname = usePathname();
  const isFooterless = FOOTERLESS_SEGMENTS.some((segment) =>
    pathname?.startsWith(segment),
  );

  if (isFooterless) {
    return null;
  }

  return (
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
  );
}
