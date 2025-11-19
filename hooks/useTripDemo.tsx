"use client";

import { useTripContext } from "@/contexts/TripContext";

// Example usage hook for testing
export function useTripDemo() {
  const { setOrigin, setDestination, setTripData } = useTripContext();

  const setDemoRoute = () => {
    // Set a demo origin
    setOrigin({
      name: "میدان آزادی",
      address: "تهران، میدان آزادی",
      coordinates: { lat: 35.6995, lng: 51.3376 },
    });

    // Set a demo destination
    setDestination({
      name: "میدان انقلاب",
      address: "تهران، میدان انقلاب",
      coordinates: { lat: 35.7008, lng: 51.3912 },
    });

    // Set additional trip data
    setTripData({
      estimatedDistance: 8.5,
      estimatedDuration: 25,
      estimatedPrice: 45000,
      selectedVehicleType: "economy",
    });
  };

  return { setDemoRoute };
}
