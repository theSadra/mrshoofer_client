"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface TripLocation {
  id: number;
  Latitude: number | null;
  Longitude: number | null;
  Description: string | null;
  TextAddress: string | null;
  PhoneNumber: string | null;
  passengerId: number;
}

// Trip data interface matching Prisma schema
export interface TripData {
  id: number;
  TicketCode: string;
  TripCode: string | null;
  Origin_id: number;
  Destination_id: number;
  OriginCity: string;
  DestinationCity: string;
  CarName: string;
  ServiceName: string;
  StartsAt: string;
  passengerId: number;
  locationId: number | null;
  PassengerSmsSent: boolean;
  AdminApproved: boolean;
  status:
    | "wating_info"
    | "wating_location"
    | "wating_start"
    | "intrip"
    | "done"
    | "canceled";
  SecureToken: string;
  driverId: number | null;
  Location?: TripLocation | null;

  // Related objects from Prisma includes
  Passenger?: {
    id: number;
    Firstname: string;
    Lastname: string;
    NumberPhone: string;
    NaCode: string | null;
  };
  OriginLocation?: TripLocation | null;
  DestinationLocation?: TripLocation | null;
  Driver?: {
    id: number;
    Firstname: string;
    Lastname: string;
    CarName: string | null;
    PhoneNumber: string;
  } | null;
}

// Context interface
interface TripContextType {
  tripData: TripData | null;
  tripToken: string | null;
  isLoading: boolean;
  error: string | null;
  setTripToken: (token: string | null) => void;
  setTripData: (data: TripData | null) => void;
  refreshTripData: () => Promise<void>;
  clearTrip: () => void;
}

// Create context
const TripContext = createContext<TripContextType | undefined>(undefined);

// Provider component
export function TripProvider({ children }: { children: React.ReactNode }) {
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [tripToken, setTripToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = React.useRef(false);

  // Fetch trip data when token changes
  const fetchTripData = async (token: string) => {
    if (!token) return;

    // Prevent duplicate fetches
    if (isFetchingRef.current) {
      console.log("TripContext: Already fetching, skipping duplicate request");

      return;
    }

    console.log("TripContext: Starting fetch for token:", token);
    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/trip/${token}`);

      console.log("TripContext: Response status:", response.status);

      if (!response.ok) {
        if (response.status === 404) {
          console.log("TripContext: Trip not found (404)");
          throw new Error("Trip not found");
        }
        throw new Error("Failed to fetch trip data");
      }

      const data = await response.json();

      const normalizedLocation =
        data.Location ??
        data.OriginLocation ??
        data.DestinationLocation ??
        null;

      // Store the token with the trip data and ensure legacy Location accessor exists
      setTripData({ ...data, Location: normalizedLocation, token });

      console.log("TripContext: Trip data fetched successfully:", data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";

      setError(errorMessage);
      console.error("TripContext: Error fetching trip data:", errorMessage);
      setTripData(null);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
      console.log("TripContext: Fetch complete, isLoading set to false");
    }
  };

  // Refresh trip data
  const refreshTripData = async () => {
    if (tripToken) {
      await fetchTripData(tripToken);
    }
  };

  // Clear trip data
  const clearTrip = () => {
    setTripData(null);
    setTripToken(null);
    setError(null);
  };

  // Fetch data when token changes
  useEffect(() => {
    if (tripToken) {
      fetchTripData(tripToken);
    } else {
      setTripData(null);
    }
  }, [tripToken]);

  const value: TripContextType = {
    tripData,
    tripToken,
    isLoading,
    error,
    setTripToken,
    setTripData,
    refreshTripData,
    clearTrip,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

// Custom hook to use the context
export function useTripContext() {
  const context = useContext(TripContext);

  // Don't throw in production - return safe defaults instead
  // This prevents "f is not a function" errors when context is undefined
  if (context === undefined) {
    console.warn("useTripContext called outside TripProvider - returning defaults");
    return {
      tripData: null,
      tripToken: null,
      isLoading: false,
      error: "Context not available",
      setTripToken: () => {},
      setTripData: () => {},
      refreshTripData: async () => {},
      clearTrip: () => {},
    };
  }

  return context;
}
