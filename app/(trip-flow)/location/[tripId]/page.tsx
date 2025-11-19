"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { useParams, useSearchParams } from "next/navigation";

import { useTripContext } from "@/contexts/TripContext";

const LocationSelectorPage = dynamic(
  () => import("../components/LocationSelectorPage"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          <span className="mt-2">در حال بارگذاری نقشه...</span>
        </div>
      </div>
    ),
  },
);

export default function LocationSelectionPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const selectionParam =
    searchParams.get("selection") === "destination" ? "destination" : "origin";
  const returnTo = searchParams.get("returnTo") || null;
  const { tripData, isLoading, error, setTripToken } = useTripContext();

  useEffect(() => {
    if (params.tripId) {
      setTripToken(params.tripId as string);
    }
  }, [params.tripId, setTripToken]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          <span className="mt-2">در حال بارگذاری اطلاعات سفر...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">خطا در بارگذاری: {error}</div>
      </div>
    );
  }

  return (
    <LocationSelectorPage
      returnTo={returnTo}
      selectionType={selectionParam}
      tripData={tripData}
      tripId={params.tripId as string}
    />
  );
}
