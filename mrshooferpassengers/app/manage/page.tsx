"use client";

import React from "react";
import Link from "next/link";

function Page() {
  return (
    <>
      <Link href="/manage/upcoming" prefetch={false}>
        Go to upcoming
      </Link>
    </>
  );
}

export default Page;
