import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Enhanced type definitions
interface Coordinates {
  lat: number;
  lng: number;
}

interface Location {
  id?: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  type?: "home" | "work" | "saved" | "recent";
  placeId?: string; // For Google Places integration
}

interface TripEstimates {
  distance?: number; // in kilometers
  duration?: number; // in minutes
  price?: number; // in IRR (Rial)
  routes?: Array<{
    description: string;
    distance: number;
    duration: number;
    price: number;
  }>;
}

interface TripState {
  // Core trip data
  origin: Location | null;
  destination: Location | null;
  estimates: TripEstimates;
  selectedVehicleType: "economy" | "comfort" | "premium";

  // UI state
  isLoadingEstimates: boolean;
  errors: {
    origin?: string;
    destination?: string;
    estimates?: string;
  };

  // Actions
  setOrigin: (location: Location | null) => void;
  setDestination: (location: Location | null) => void;
  setVehicleType: (type: "economy" | "comfort" | "premium") => void;
  swapLocations: () => void;
  clearTrip: () => void;

  // Computed getters
  hasOrigin: () => boolean;
  hasDestination: () => boolean;
  hasCompleteRoute: () => boolean;
  isValid: () => boolean;

  // Async actions
  calculateEstimates: () => Promise<void>;

  // Error handling
  setError: (field: keyof TripState["errors"], message: string) => void;
  clearErrors: () => void;
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      // Initial state
      origin: null,
      destination: null,
      estimates: {},
      selectedVehicleType: "economy",
      isLoadingEstimates: false,
      errors: {},

      // Basic setters
      setOrigin: (location) => {
        set({ origin: location });
        get().clearErrors();
        // Auto-calculate estimates if both locations exist
        if (location && get().destination) {
          get().calculateEstimates();
        }
      },

      setDestination: (location) => {
        set({ destination: location });
        get().clearErrors();
        // Auto-calculate estimates if both locations exist
        if (location && get().origin) {
          get().calculateEstimates();
        }
      },

      setVehicleType: (type) => {
        set({ selectedVehicleType: type });
        // Recalculate estimates with new vehicle type
        if (get().hasCompleteRoute()) {
          get().calculateEstimates();
        }
      },

      swapLocations: () => {
        const { origin, destination } = get();

        set({
          origin: destination,
          destination: origin,
        });
        if (get().hasCompleteRoute()) {
          get().calculateEstimates();
        }
      },

      clearTrip: () => {
        set({
          origin: null,
          destination: null,
          estimates: {},
          selectedVehicleType: "economy",
          errors: {},
          isLoadingEstimates: false,
        });
      },

      // Computed getters
      hasOrigin: () => get().origin !== null,
      hasDestination: () => get().destination !== null,
      hasCompleteRoute: () =>
        get().origin !== null && get().destination !== null,

      isValid: () => {
        const state = get();

        return (
          state.hasCompleteRoute() &&
          Object.keys(state.errors).length === 0 &&
          state.origin!.coordinates.lat !== 0 &&
          state.destination!.coordinates.lat !== 0
        );
      },

      // Async estimate calculation
      calculateEstimates: async () => {
        const { origin, destination, selectedVehicleType } = get();

        if (!origin || !destination) return;

        set({ isLoadingEstimates: true });

        try {
          // Mock API call - replace with your actual service
          const estimates = await calculateTripEstimates(
            origin.coordinates,
            destination.coordinates,
            selectedVehicleType,
          );

          set({
            estimates,
            isLoadingEstimates: false,
          });
        } catch (error) {
          set({
            isLoadingEstimates: false,
          });
          get().setError("estimates", "خطا در محاسبه تخمین مسیر");
        }
      },

      // Error handling
      setError: (field, message) => {
        set((state) => ({
          errors: { ...state.errors, [field]: message },
        }));
      },

      clearErrors: () => {
        set({ errors: {} });
      },
    }),
    {
      name: "mrshoofer-trip-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist essential data, not UI state
      partialize: (state) => ({
        origin: state.origin,
        destination: state.destination,
        selectedVehicleType: state.selectedVehicleType,
      }),
    },
  ),
);

// Mock estimation service (replace with actual implementation)
async function calculateTripEstimates(
  origin: Coordinates,
  destination: Coordinates,
  vehicleType: string,
): Promise<TripEstimates> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Mock calculation (replace with real service call)
  const distance = calculateDistance(origin, destination);
  const baseDuration = distance * 3; // 3 minutes per km (rough estimate)
  const basePrice = distance * 5000; // 5000 IRR per km base price

  const vehicleMultipliers = {
    economy: 1,
    comfort: 1.3,
    premium: 1.8,
  };

  const multiplier =
    vehicleMultipliers[vehicleType as keyof typeof vehicleMultipliers] || 1;

  return {
    distance: Math.round(distance * 10) / 10,
    duration: Math.round(baseDuration),
    price: Math.round(basePrice * multiplier),
    routes: [
      {
        description: "سریع‌ترین مسیر",
        distance: distance,
        duration: baseDuration,
        price: basePrice * multiplier,
      },
      {
        description: "کم‌ترین ترافیک",
        distance: distance * 1.15,
        duration: baseDuration * 0.85,
        price: basePrice * multiplier * 1.1,
      },
    ],
  };
}

// Haversine formula for distance calculation
function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLon = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Export types for use in components
export type { Location, TripEstimates, TripState, Coordinates };
