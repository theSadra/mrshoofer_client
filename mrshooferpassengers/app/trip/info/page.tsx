import React from "react";
import TripInfo from "./components/tripinfo";
import { TripStatus } from "@prisma/client";

function Upcoming() {
  // Mocked trip object
  const trip = {
    id: 1,
    TicketCode: "ABC123",
    TripCode: "TRIP001",
    Origin_id: 10,
    Destination_id: 20,
    OriginCity: "تهران",
    DestinationCity: "شیراز",
    CarName: "سمند|پژو",
    ServiceName: "سرویس اکو",
    StartsAt: new Date(),
    passengerId: 5,
    locationId: 2,
    status: TripStatus.intrip,
    PassengerSmsSent: false,
    AdminApproved: false,
  };

  return (
    <div>
      <TripInfo
        trip={{
          id: 0,
          TicketCode: "24597503",
          TripCode: null,
          Origin_id: 1,
          Destination_id: 2,
          OriginCity: "تهران",
          DestinationCity: "اصفهان",
          CarName: "کمری|سوناتا|سافران",
          ServiceName: "تشریفات VIP",
          StartsAt: new Date(),
          passengerId: 0,
          PassengerSmsSent: false,
          AdminApproved: false,
          status: TripStatus.wating_info,
          locationId: null,
          Location: null, // if using the relation
        }}
      />
    </div>
  );
}

export default Upcoming;
