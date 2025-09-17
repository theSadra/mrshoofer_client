"use client";

import React from "react";
import dynamic from "next/dynamic";

export type LocationMapProps = {
  lat: number;
  lng: number;
  zoom?: number;
  className?: string;
  height?: number | string;
};

const LocationMapClient = dynamic(() => import("./LocationMapClient"), {
  ssr: false,
  loading: () => <div className="w-full h-[320px] rounded-xl bg-default-100" />,
});

export default function LocationMap(props: LocationMapProps) {
  return <LocationMapClient {...props} />;
}
