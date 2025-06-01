"use client";
import React from "react";
import { Button, Drawer, DrawerBody, DrawerFooter, DrawerHeader, useDisclosure } from "@heroui/react";
import { Icon } from "@iconify/react";

interface DirectionSheetProps {
    latitude: number;
    longitude: number;
}

const directionApps = [
    {
        name: "Google Maps",
        url: (lat: number, lng: number) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
        icon: "logos:google-maps",
        color: "primary",
    },
    {
        name: "Neshan",
        url: (lat: number, lng: number) => `https://neshan.org/maps?lat=${lat}&lng=${lng}`,
        icon: "simple-icons:neshan",
        color: "success",
    },
    {
        name: "Waze",
        url: (lat: number, lng: number) => `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`,
        icon: "simple-icons:waze",
        color: "warning",
    },
    {
        name: "بلد",
        url: (lat: number, lng: number) => `https://balad.ir/route?destination=${lat},${lng}`,
        icon: "simple-icons:balad",
        color: "secondary",
    },
];

const DirectionSheet: React.FC<DirectionSheetProps> = ({ latitude, longitude }) => {

    return (
        <>
        </>
    );
};

export default DirectionSheet;
