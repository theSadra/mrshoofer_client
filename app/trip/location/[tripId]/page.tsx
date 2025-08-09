"use client";

import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import LocationSelectorPage to prevent SSR issues with maps
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
    const router = useRouter();
    const tripId = params.tripId as string;

    const handleSuccess = () => {
        // Navigate back to the trip info page after successful submission
        router.push(`/trip/info/${tripId}`);
    };

    const handleCancel = () => {
        // Navigate back to the trip info page if user cancels
        router.push(`/trip/info/${tripId}`);
    };

    return (
        <LocationSelectorPage
            tripId={tripId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
        />
    );
}
