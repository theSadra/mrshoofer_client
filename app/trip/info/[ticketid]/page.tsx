"use client";

import React, { useEffect, use, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import TripInfo from "../components/tripinfo";
import LocationSuccessModal from "../components/LocationSuccessModal";
import LocationAddedModal from "../components/LocationAddedModal";
import LocationUpdatedModal from "../components/LocationUpdatedModal";
import { useTripContext } from "../../../contexts/TripContext";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from "@heroui/react";



export default function Upcoming({ params }: { params: Promise<{ ticketid: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const { tripData, loading, error, fetchTripData } = useTripContext();
  const hasInitialized = useRef(false);
  const lastRefreshParam = useRef<string | null>(null);

  // Success modal states
  const [showAddedModal, setShowAddedModal] = useState(false);
  const [showUpdatedModal, setShowUpdatedModal] = useState(false);

  useEffect(() => {
    const refreshParam = searchParams.get('refresh');
    const ticketId = resolvedParams.ticketid;

    // Only fetch if we haven't initialized or if refresh parameter changed
    if (!hasInitialized.current || (refreshParam && refreshParam !== lastRefreshParam.current)) {
      console.log('Fetching trip data:', { hasInitialized: hasInitialized.current, refreshParam });

      if (refreshParam) {
        // If refresh parameter exists, force fresh data fetch
        console.log('Refresh parameter detected - fetching fresh data');
        fetchTripData(ticketId, true); // Force refresh
        lastRefreshParam.current = refreshParam;
      } else {
        // Normal fetch
        fetchTripData(ticketId);
      }

      hasInitialized.current = true;
    }
  }, [resolvedParams.ticketid, searchParams.get('refresh'), fetchTripData]); // Only depend on the actual refresh param value

  // Success modal detection
  useEffect(() => {
    const success = searchParams.get('success');

    if (success === 'location_added') {
      setShowAddedModal(true);
      // Clean URL after detecting success parameter
      window.history.replaceState({}, '', window.location.pathname);
    } else if (success === 'location_updated') {
      setShowUpdatedModal(true);
      // Clean URL after detecting success parameter
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);

  // Force refresh when page gains focus (user returns from location selector)
  // Only if we don't already have recent data
  useEffect(() => {
    const handleFocus = () => {
      const refreshParam = searchParams.get('refresh');
      if (!refreshParam) { // Only refresh on focus if no refresh param (avoid double refresh)
        console.log('Page gained focus - refreshing trip data');
        fetchTripData(resolvedParams.ticketid, true); // Force refresh
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleFocus();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [resolvedParams.ticketid, fetchTripData, searchParams.get('refresh')]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
    <div>
      <TripInfo trip={tripData} />


      <LocationAddedModal
        isOpen={showAddedModal}
        onOpenChange={setShowAddedModal}
      />
      <LocationUpdatedModal
        isOpen={showUpdatedModal}
        onOpenChange={setShowUpdatedModal}
      />
    </div>
  );
}
