"use client";

import React from "react";
import Link from "next/link";

export default function DriversPage() {
  return (
    <div className="min-h-screen flex flex-col p-6">
      <h1 className="text-3xl font-bold mb-4">مدیریت رانندگان</h1>
      <p className="mb-6 text-default-500">در این صفحه می‌توانید رانندگان را مشاهده و مدیریت کنید.</p>
      {/* Add driver management features here in next steps */}
      <Link href="/manage/upcoming" className="text-primary underline">
        بازگشت به سفرهای پیش‌رو
      </Link>
    </div>
  );
}
