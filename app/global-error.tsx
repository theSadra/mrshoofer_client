"use client";

import { useEffect } from "react";

const SHOW_FULL_ERRORS =
  process.env.NEXT_PUBLIC_EXPOSE_FULL_ERRORS === "true" ||
  process.env.NODE_ENV !== "production";

/**
 * @param {{ error: Error; reset: () => void }} props
 */
export default function GlobalError({
  error,
  reset,
}) {
  useEffect(() => {
    /* eslint-disable no-console */
    console.error("[Global App Error]", error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen flex flex-col items-center justify-center gap-6 bg-default-50 px-6 py-12 text-center">
        <div>
          <h2 className="text-2xl font-bold text-danger-500">خطای بحرانی در برنامه</h2>
          <p className="text-default-600 mt-2">
            اپلیکیشن به خطای سیستمی برخورد کرد. لطفاً صفحه را مجدداً بارگیری کنید یا تیم فنی را مطلع سازید.
          </p>
        </div>

        {SHOW_FULL_ERRORS && (
          <div className="w-full max-w-3xl text-left bg-white shadow-md rounded-lg border border-danger-200 p-4">
            <p className="font-semibold text-danger-500">پیام خطا</p>
            <code className="block text-sm text-danger-600 break-words whitespace-pre-wrap mt-2">
              {error?.message || "خطا بدون پیام"}
            </code>

            {error?.stack && (
              <details className="mt-4" open>
                <summary className="cursor-pointer text-sm font-medium text-default-500">
                  جزئیات فنی (Stack Trace)
                </summary>
                <pre className="overflow-auto text-xs bg-default-50 p-3 mt-2 rounded border border-default-200">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        <button
          className="px-5 py-2 bg-primary text-white rounded-md shadow hover:bg-primary/90 transition"
          onClick={() => reset()}
        >
          بارگذاری مجدد صفحه
        </button>
      </body>
    </html>
  );
}
