"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useEffect } from "react";

import { useTripContext } from "../../../contexts/TripContext";

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
  const { tripData, loading, error, fetchTripData } = useTripContext();

  useEffect(() => {
    if (params.tripId) {
      fetchTripData(params.tripId as string);
    }
  }, [params.tripId, fetchTripData]);

  if (loading) {
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
      tripData={tripData}
      tripId={params.tripId as string}
    />
  );
}
