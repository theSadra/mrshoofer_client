// Example: How to use TripContext in any component

import { useTripContext } from "@/contexts/TripContext";

export default function ExampleComponent() {
  const { tripData, isLoading, error, tripToken } = useTripContext();

  // Loading state
  if (isLoading) {
    return <div>Loading trip data...</div>;
  }

  // Error state
  if (error) {
    return <div>Error: {error}</div>;
  }

  // No trip data
  if (!tripData) {
    return <div>No trip data available</div>;
  }

  // Display trip data
  return (
    <div>
      <h2>Trip Information</h2>
      <p>Trip ID: {tripData.id}</p>
      <p>Token: {tripToken}</p>
      <p>Origin: {tripData.OriginLocation?.TextAddress ?? "تعیین نشده"}</p>
      <p>
        Destination: {tripData.DestinationLocation?.TextAddress ?? "تعیین نشده"}
      </p>
      <p>
        Passenger:{" "}
        {tripData.Passenger
          ? `${tripData.Passenger.Firstname} ${tripData.Passenger.Lastname}`
          : "نامشخص"}
      </p>
      <p>Status: {tripData.status}</p>

      {/* Access all trip data properties */}
      <pre>{JSON.stringify(tripData, null, 2)}</pre>
    </div>
  );
}
