import { PrismaClient } from '@prisma/client';
import TripPage from './components/trippage';
import React from 'react';

const prisma = new PrismaClient();

// This must be a server component to fetch from the DB
export default async function DriverTripPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const trip = await prisma.trip.findUnique({
        where: { SecureToken: resolvedParams.id },
        include: { Driver: true, Passenger: true, Location: true },
    });

    if (!trip) {
        return <div>سفر پیدا نشد.</div>;
    }

    return (
        <TripPage trip={trip} />
    );
}
