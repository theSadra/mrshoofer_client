"use client";

import React, { useEffect, use, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import TripInfo from "../components/tripinfo-new";
import LocationAddedModal from "../components/LocationAddedModal";
import LocationUpdatedModal from "../components/LocationUpdatedModal";
import { useTripContext } from "@/app/contexts/TripContext";
import WelcomePassengerModal from "../components/WelcomePassengerModal";

export default function Upcoming({
  params,
}: {
  params: Promise<{ ticketid: string }>;
}) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const { tripData, loading, error, fetchTripData } = useTripContext();
  const hasInitialized = useRef(false);
  const lastRefreshParam = useRef<string | null>(null);

  // Success modal states
  const [showAddedModal, setShowAddedModal] = useState(false);
  const [showUpdatedModal, setShowUpdatedModal] = useState(false);

  useEffect(() => {
    const refreshParam = searchParams.get("refresh");
    const ticketId = resolvedParams.ticketid;

    // Only fetch if we haven't initialized or if refresh parameter changed
    if (
      !hasInitialized.current ||
      (refreshParam && refreshParam !== lastRefreshParam.current)
    ) {
      console.log("Fetching trip data:", {
        hasInitialized: hasInitialized.current,
        refreshParam,
      });

      if (refreshParam) {
        // If refresh parameter exists, force fresh data fetch
        console.log("Refresh parameter detected - fetching fresh data");
        fetchTripData(ticketId, true); // Force refresh
        lastRefreshParam.current = refreshParam;
      } else {
        // Normal fetch
        fetchTripData(ticketId);
      }

      hasInitialized.current = true;
    }
  }, [resolvedParams.ticketid, searchParams.get("refresh"), fetchTripData]);

  // Success modal detection
  useEffect(() => {
    const success = searchParams.get("success");

    if (success === "location_added") {
      setShowAddedModal(true);
      // Clean URL after detecting success parameter
      window.history.replaceState({}, "", window.location.pathname);
    } else if (success === "location_updated") {
      setShowUpdatedModal(true);
      // Clean URL after detecting success parameter
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams]);

  // Force refresh when page gains focus (user returns from location selector)
  // Only if we don't already have recent data
  useEffect(() => {
    const handleFocus = () => {
      const refreshParam = searchParams.get("refresh");

      if (!refreshParam) {
        // Only refresh on focus if no refresh param (avoid double refresh)
        console.log("Page gained focus - refreshing trip data");
        fetchTripData(resolvedParams.ticketid, true); // Force refresh
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleFocus();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [resolvedParams.ticketid, fetchTripData, searchParams.get("refresh")]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200" />
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent absolute top-0 left-0" />
          </div>
          <span className="text-slate-600 font-medium animate-pulse">در حال بارگذاری اطلاعات سفر...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-slate-50 to-white">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <div className="text-red-500 font-semibold text-lg">خطا در بارگذاری</div>
          <div className="text-slate-600 mt-2">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 transition-colors duration-500 scroll-smooth">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8 relative">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-blue-100/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-100/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10">
          <TripInfo trip={tripData} />

          <LocationAddedModal
            isOpen={showAddedModal}
            onOpenChange={setShowAddedModal}
          />
          <LocationUpdatedModal
            isOpen={showUpdatedModal}
            onOpenChange={setShowUpdatedModal}
          />

          <WelcomePassengerModal
            showOneTime={true}
            tripId={resolvedParams.ticketid}
          />
        </div>
      </div>
    </div>
  );
}
