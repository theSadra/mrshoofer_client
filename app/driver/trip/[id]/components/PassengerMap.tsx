"use client";

import React, { useEffect, useState } from "react";
import { MapComponent, MapTypes } from "@neshan-maps-platform/mapbox-gl-react";
import "@neshan-maps-platform/mapbox-gl/dist/NeshanMapboxGl.css";
import nmp_mapboxgl from "@neshan-maps-platform/mapbox-gl";

const MAP_KEY = process.env.NEXT_PUBLIC_NESHAN_MAP_KEY || "web.629d398efe5a4b3d90b9d032569935a6";

const getAddressFromNeshan = async (lat: number, lng: number) => {
    const API_KEY = process.env.NEXT_PUBLIC_NESHAN_API_KEY || "service.6f5734c50a9c43cba6f43a6254c1b668";
    const url = `https://api.neshan.org/v5/reverse?lat=${lat}&lng=${lng}`;
    const res = await fetch(url, { headers: { "Api-Key": API_KEY } });
    if (!res.ok) return "";
    const data = await res.json();
    return data.formatted_address || "";
};

interface PassengerMapProps {
    latitude: number;
    longitude: number;
}

const PassengerMap: React.FC<PassengerMapProps> = ({ latitude, longitude }) => {
    const [address, setAddress] = useState("");
    useEffect(() => {
        getAddressFromNeshan(latitude, longitude).then(setAddress);
    }, [latitude, longitude]);

    return (
        <div className="w-full  rounded-xl overflow-hidden border border-default-200 flex flex-col items-center" style={{ maxWidth: 320, margin: '0 auto' }}>
            <div className="relative w-full h-80">
                <MapComponent
                    options={{
                        mapKey: MAP_KEY,
                        mapType: MapTypes.neshanVector,
                        center: [longitude, latitude],
                        zoom: 12,
                        poi: false,
                        mapTypeControllerOptions: {
                            show: false,
                        },
                        traffic: false,
                        maxZoom: 19,
                        minZoom: 5,
                        dragPan: false,
                        dragRotate: false,
                        scrollZoom: false,
                        doubleClickZoom: false,
                        keyboard: false,
                        boxZoom: false,
                        interactive: false, // Uncomment if supported by Neshan SDK
                    }}
                    mapSetter={() => { }}
                />
                {/* Pin always visually centered over the map center */}
                <img src="/pin.png" alt="pin" width={33} height={33} style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -100%)', pointerEvents: 'none', zIndex: 30 }} />
            </div>
        </div>
    );
};

export default PassengerMap;
