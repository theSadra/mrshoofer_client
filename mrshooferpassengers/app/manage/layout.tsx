"use client";
import React from "react";
import Layout from "./components/App";

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center bg-background">
      <div className="lg:container sm:mx-0 sm:px-1 mx-auto w-full md:px-0 lg:mx-10">
        <Layout>{children}</Layout>
      </div>
    </div>
  );
}
