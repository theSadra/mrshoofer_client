"use client";
import AppNavbar from "@/app/components/AppNavbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppNavbar />
      <main className="pt-4">{children}</main>
    </>
  );
}
