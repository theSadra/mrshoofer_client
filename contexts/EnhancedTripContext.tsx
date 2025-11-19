"use client";

import React, { createContext, useContext, useReducer, useEffect } from "react";

// Enhanced types
interface Location {
  id?: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  type?: "home" | "work" | "other";
  placeId?: string;
}

interface TripEstimates {
  distance?: number;
  duration?: number;
  price?: number;
}

interface TripState {
  origin: Location | null;
  destination: Location | null;
  estimates: TripEstimates;
  vehicleType: "economy" | "comfort" | "premium";
  isLoadingEstimates: boolean;
  errors: Record<string, string>;
}

// Action types
type TripAction =
  | { type: "SET_ORIGIN"; payload: Location | null }
  | { type: "SET_DESTINATION"; payload: Location | null }
  | { type: "SET_VEHICLE_TYPE"; payload: "economy" | "comfort" | "premium" }
  | { type: "SET_ESTIMATES"; payload: TripEstimates }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: { field: string; message: string } }
  | { type: "CLEAR_ERRORS" }
  | { type: "SWAP_LOCATIONS" }
  | { type: "CLEAR_TRIP" }
  | { type: "HYDRATE"; payload: Partial<TripState> };

// Reducer with proper state management
function tripReducer(state: TripState, action: TripAction): TripState {
  switch (action.type) {
    case "SET_ORIGIN":
      return {
        ...state,
        origin: action.payload,
        errors: { ...state.errors, origin: "" },
      };

    case "SET_DESTINATION":
      return {
        ...state,
        destination: action.payload,
        errors: { ...state.errors, destination: "" },
      };

    case "SET_VEHICLE_TYPE":
      return { ...state, vehicleType: action.payload };

    case "SET_ESTIMATES":
      return {
        ...state,
        estimates: action.payload,
        isLoadingEstimates: false,
      };

    case "SET_LOADING":
      return { ...state, isLoadingEstimates: action.payload };

    case "SET_ERROR":
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.field]: action.payload.message,
        },
        isLoadingEstimates: false,
      };

    case "CLEAR_ERRORS":
      return { ...state, errors: {} };

    case "SWAP_LOCATIONS":
      return {
        ...state,
        origin: state.destination,
        destination: state.origin,
      };

    case "CLEAR_TRIP":
      return initialState;

    case "HYDRATE":
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

const initialState: TripState = {
  origin: null,
  destination: null,
  estimates: {},
  vehicleType: "economy",
  isLoadingEstimates: false,
  errors: {},
};

// Context
interface TripContextType {
  state: TripState;
  actions: {
    setOrigin: (location: Location | null) => void;
    setDestination: (location: Location | null) => void;
    setVehicleType: (type: "economy" | "comfort" | "premium") => void;
    swapLocations: () => void;
    clearTrip: () => void;
    calculateEstimates: () => Promise<void>;
  };
  computed: {
    hasOrigin: boolean;
    hasDestination: boolean;
    hasCompleteRoute: boolean;
    isValid: boolean;
  };
}

const TripContext = createContext<TripContextType | undefined>(undefined);

// Enhanced Provider with proper error handling and persistence
export function TripProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("mrshoofer-trip");

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);

        dispatch({ type: "HYDRATE", payload: parsed });
      } catch (error) {
        console.error("Failed to parse saved trip data:", error);
        localStorage.removeItem("mrshoofer-trip");
      }
    }
  }, []);

  // Persist essential data to localStorage
  useEffect(() => {
    const dataToSave = {
      origin: state.origin,
      destination: state.destination,
      vehicleType: state.vehicleType,
    };

    localStorage.setItem("mrshoofer-trip", JSON.stringify(dataToSave));
  }, [state.origin, state.destination, state.vehicleType]);

  // Auto-calculate estimates when route changes
  useEffect(() => {
    if (state.origin && state.destination && !state.isLoadingEstimates) {
      calculateEstimates();
    }
  }, [state.origin, state.destination, state.vehicleType]);

  const setOrigin = (location: Location | null) => {
    dispatch({ type: "SET_ORIGIN", payload: location });
  };

  const setDestination = (location: Location | null) => {
    dispatch({ type: "SET_DESTINATION", payload: location });
  };

  const setVehicleType = (type: "economy" | "comfort" | "premium") => {
    dispatch({ type: "SET_VEHICLE_TYPE", payload: type });
  };

  const swapLocations = () => {
    dispatch({ type: "SWAP_LOCATIONS" });
  };

  const clearTrip = () => {
    dispatch({ type: "CLEAR_TRIP" });
    localStorage.removeItem("mrshoofer-trip");
  };

  const calculateEstimates = async () => {
    if (!state.origin || !state.destination) return;

    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "CLEAR_ERRORS" });

    try {
      // Mock API call - replace with actual service
      const estimates = await mockCalculateEstimates(
        state.origin.coordinates,
        state.destination.coordinates,
        state.vehicleType,
      );

      dispatch({ type: "SET_ESTIMATES", payload: estimates });
    } catch (error) {
      dispatch({
        type: "SET_ERROR",
        payload: {
          field: "estimates",
          message: "خطا در محاسبه تخمین مسیر",
        },
      });
    }
  };

  // Computed values
  const computed = {
    hasOrigin: state.origin !== null,
    hasDestination: state.destination !== null,
    hasCompleteRoute: state.origin !== null && state.destination !== null,
    isValid:
      state.origin !== null &&
      state.destination !== null &&
      Object.keys(state.errors).length === 0,
  };

  const contextValue: TripContextType = {
    state,
    actions: {
      setOrigin,
      setDestination,
      setVehicleType,
      swapLocations,
      clearTrip,
      calculateEstimates,
    },
    computed,
  };

  return (
    <TripContext.Provider value={contextValue}>{children}</TripContext.Provider>
  );
}

// Enhanced hook with error boundaries
export function useTripContext() {
  const context = useContext(TripContext);

  if (context === undefined) {
    throw new Error("useTripContext must be used within a TripProvider");
  }

  return context;
}

// Mock service (replace with actual implementation)
async function mockCalculateEstimates(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  vehicleType: string,
): Promise<TripEstimates> {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Simple distance calculation
  const distance =
    Math.sqrt(
      Math.pow(destination.lat - origin.lat, 2) +
        Math.pow(destination.lng - origin.lng, 2),
    ) * 111; // Rough km conversion

  const multipliers = { economy: 1, comfort: 1.3, premium: 1.8 };
  const multiplier = multipliers[vehicleType as keyof typeof multipliers] || 1;

  return {
    distance: Math.round(distance * 10) / 10,
    duration: Math.round(distance * 3),
    price: Math.round(distance * 5000 * multiplier),
  };
}

export type { Location, TripState, TripEstimates };
