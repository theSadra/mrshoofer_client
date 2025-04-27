import React from 'react'
import TripInfo from './components/tripinfo'
import { TripStatus } from '@prisma/client'

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
    status: TripStatus.wating_info,
    PassengerSmsSent: false,
    AdminApproved: false,
  }

  return (
    <div>
      <TripInfo trip={trip} />
    </div>
  )
}

export default Upcoming