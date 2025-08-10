"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

const LocationSelectorPage = dynamic(() => import('../components/LocationSelectorPage'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="mt-2">در حال بارگذاری نقشه...</span>
            </div>
        </div>
    )
});

export default function LocationSelectionPage() {
    const params = useParams();
    return <LocationSelectorPage tripId={params.tripId} />;
}
