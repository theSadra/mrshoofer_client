import React from "react";
import Link from "next/link";

export const metadata = {
  title: "403 - دسترسی غیرمجاز",
};

export default function ForbiddenPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center space-y-6">
      <div className="space-y-2">
        <h1 className="text-6xl font-bold text-danger-500">403</h1>
        <h2 className="text-2xl font-semibold">دسترسی غیرمجاز</h2>
        <p className="text-default-500 max-w-md leading-relaxed">
          شما اجازه دسترسی به این صفحه یا منبع را ندارید. اگر فکر می‌کنید این یک
          خطاست، لطفا دوباره وارد شوید یا با مدیر سیستم تماس بگیرید.
        </p>
      </div>
      <div className="flex gap-4 flex-wrap justify-center">
        <Link
          className="px-5 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition"
          href="/"
        >
          صفحه اصلی
        </Link>
        <Link
          className="px-5 py-2 rounded-md border border-default-300 hover:bg-default-100 transition"
          href="/manage/login"
        >
          ورود مدیریت
        </Link>
      </div>
    </main>
  );
}
