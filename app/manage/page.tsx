"use client";

import React from "react";
import Link from "next/link";

// Move this page to (protected) so it is protected by session check
export default function Page() {
  return (
    <>
      <Link href="/manage/upcoming" prefetch={false}>
        Go to upcoming
      </Link>
    </>
  );
}
