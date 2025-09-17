"use client";

import React from "react";
import { MapComponent, MapTypes } from "@neshan-maps-platform/mapbox-gl-react";
import nmp_mapboxgl from "@neshan-maps-platform/mapbox-gl";
import "@neshan-maps-platform/mapbox-gl/dist/NeshanMapboxGl.css";

export type LocationMapProps = {
  lat: number;
  lng: number;
  zoom?: number;
  className?: string;
  height?: number | string;
};

export default function LocationMapClient({
  lat,
  lng,
  zoom = 15,
  className,
  height = 320,
}: LocationMapProps) {
  const [map, setMap] = React.useState<any>(null);

  const mapKey =
    process.env.NEXT_PUBLIC_NESHAN_MAP_KEY ||
    "web.629d398efe5a4b3d90b9d032569935a6";

  React.useEffect(() => {
    if (!map || typeof lat !== "number" || typeof lng !== "number") return;
    try {
      const marker = new (nmp_mapboxgl as any).Marker({ color: "#e11d48" });

      marker.setLngLat([lng, lat]).addTo(map);
    } catch {
      // ignore marker errors
    }
  }, [map, lat, lng]);

  return (
    <div className={className} style={{ height }}>
      <MapComponent
        mapSetter={(m: any) => setMap(m)}
        options={{
          mapKey,
          mapType: MapTypes.neshanPlaces,
          center: { lat, lng },
          zoom,
          minZoom: 5,
          maxZoom: 19,
          trackResize: true,
          mapTypeControllerStatus: { show: false },
          mapTypeControllerOptions: { show: false },
        }}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 12,
          overflow: "hidden",
        }}
      />
    </div>
  );
}
