"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";

interface TripLocation {
  id: number;
  Latitude: number | null;
  Longitude: number | null;
  Description: string | null;
  TextAddress: string | null;
  PhoneNumber: string | null;
  passengerId: number;
}

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

const TripContext = createContext<TripContextType | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  console.log("TripProvider (trip-flow): Initializing");
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [tripToken, setTripToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFetchingRef = useRef(false);

  const fetchTripData = async (token: string) => {
    if (!token) return;
    if (isFetchingRef.current) {
      console.log("TripProvider (trip-flow): Already fetching, skipping duplicate");
      return;
    }

    console.log("TripProvider (trip-flow): Fetching trip data for token:", token);
    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/trip/${token}`);
      console.log("TripProvider (trip-flow): Fetch response status:", response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch trip: ${response.status}`);
      }

      const data = await response.json();
      console.log("TripProvider (trip-flow): Fetched trip data:", data);
      setTripData(data);
      setError(null);
    } catch (err) {
      console.error("TripProvider (trip-flow): Error fetching trip:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch trip");
      setTripData(null);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (tripToken) {
      console.log("TripProvider (trip-flow): Token changed, fetching data:", tripToken);
      fetchTripData(tripToken);
    } else {
      console.log("TripProvider (trip-flow): No token, clearing data");
      setTripData(null);
      setError(null);
    }
  }, [tripToken]);

  const refreshTripData = async () => {
    if (tripToken) {
      await fetchTripData(tripToken);
    }
  };

  const clearTrip = () => {
    setTripToken(null);
    setTripData(null);
    setError(null);
    setIsLoading(false);
  };

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

  console.log("TripProvider (trip-flow): Rendering with value:", {
    hasTripData: !!tripData,
    hasTripToken: !!tripToken,
    isLoading,
    hasError: !!error,
  });

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export function useTripContext() {
  const context = useContext(TripContext);
  if (context === undefined) {
    console.error("useTripContext must be used within TripProvider (trip-flow)");
    return {
      tripData: null,
      tripToken: null,
      isLoading: false,
      error: null,
      setTripToken: () => {},
      setTripData: () => {},
      refreshTripData: async () => {},
      clearTrip: () => {},
    };
  }
  return context;
}
