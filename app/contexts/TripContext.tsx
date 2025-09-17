"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Prisma } from "@prisma/client";

// Use the exact Prisma type that matches your database schema
type TripData = Prisma.TripGetPayload<{
  include: {
    Location: true;
    Passenger: true;
    Driver: true;
  };
}>;

interface TripContextType {
  tripData: TripData | null;
  setTripData: (data: TripData | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  fetchTripData: (tripId: string, forceRefresh?: boolean) => Promise<void>;
  clearTripData: () => void;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const useTripContext = () => {
  const context = useContext(TripContext);

  if (context === undefined) {
    throw new Error("useTripContext must be used within a TripProvider");
  }

  return context;
};

interface TripProviderProps {
  children: ReactNode;
}

export const TripProvider: React.FC<TripProviderProps> = ({ children }) => {
  const [tripData, setTripData] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTripData = useCallback(
    async (tripId: string, forceRefresh: boolean = false) => {
      if (!forceRefresh && tripData && tripData.SecureToken === tripId) {
        // If we already have the data for this trip and not forcing refresh, don't fetch again
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/trip/${tripId}?t=${Date.now()}`); // Add timestamp to prevent caching

        if (!response.ok) {
          throw new Error(`Failed to fetch trip: ${response.statusText}`);
        }
        const trip = await response.json();

        setTripData(trip);
      } catch (err) {
        console.error("Error fetching trip:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch trip data",
        );
      } finally {
        setLoading(false);
      }
    },
    [tripData],
  ); // Only depend on tripData

  const clearTripData = useCallback(() => {
    setTripData(null);
    setError(null);
    setLoading(false);
  }, []);

  const value: TripContextType = {
    tripData,
    setTripData,
    loading,
    setLoading,
    error,
    setError,
    fetchTripData,
    clearTripData,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
};
