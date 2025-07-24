"use client";

import React from 'react';
import { Trip, Passenger, Driver } from '@prisma/client';
import { Button } from '@heroui/react';
import TripInfo from './tripinfo';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Icon } from "@iconify/react";
import CountdownTimer from './CountdownTimer';
import dynamic from 'next/dynamic';

import DirectionSheet from './DirectionSheet';
import { useDisclosure, Image, Divider } from '@heroui/react';

import { Drawer, DrawerHeader, DrawerBody, DrawerFooter, DrawerContent } from '@heroui/drawer';
import NeshanLogo from './NeshanLogo';
import GoogleMapsLogo from './GoogleMapsLogo';

// Dynamically import the map component to avoid SSR issues
const PassengerMap = dynamic(() => import('./PassengerMap'), { ssr: false });

const MAP_KEY = process.env.NEXT_PUBLIC_NESHAN_MAP_KEY || "web.629d398efe5a4b3d90b9d032569935a6";
const API_KEY = process.env.NEXT_PUBLIC_NESHAN_API_KEY || "service.6f5734c50a9c43cba6f43a6254c1b668";


interface TripPageProps {
    trip: Trip & {
        Passenger?: Passenger | null;
        Driver?: Driver | null;
        Location?: {
            Latitude: number | null;
            Longitude: number | null;
            TextAddress?: string | null;
        } | null;
    };
}


function TripPage({ trip }: TripPageProps) {

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
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    // Helper to open navigation app with correct URL and close drawer
    const handleDirection = (platform: 'neshan' | 'google' | 'waze' | 'balad', onClose?: () => void) => {
        if (!trip.Location || typeof trip.Location.Latitude !== 'number' || typeof trip.Location.Longitude !== 'number') return;
        const lat = trip.Location.Latitude;
        const lng = trip.Location.Longitude;
        let url = '';
        switch (platform) {
            case 'neshan':
                url = `https://neshan.org/maps?lat=${lat}&lng=${lng}`;
                break;
            case 'google':
                url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
                break;
            case 'waze':
                url = `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`;
                break;
            case 'balad':
                url = `https://balad.ir/route?destination=${lat},${lng}`;
                break;
        }
        window.open(url, '_blank');
        if (onClose) onClose();
    };

    return (
        <div dir="rtl">
            <div className="mt-2 flex justify-start gap-2 items-center mb-4 ">
                <Icon icon="fluent-color:person-starburst-28" width={26} ></Icon>
                <p className="text-lg font-semibold ">
                    {trip.Driver?.Firstname} {trip.Driver?.Lastname} {" "}
                    <span className="text-default-700 font-normal">
                        عزیز
                        خوش آمدید!
                    </span>
                </p>
            </div>


            <Divider className='mb-5' />

            <TripInfo trip={trip as any} />

            <div className="flex justify-around mt-5">
                <p className='text-lg font-bold text-default-700'>
                    ساعت شروع سفر :
                </p>
                <Chip variant='bordered' size='lg' className='text-2xl font-bold mb-6' color='primary'>
                    {trip.StartsAt instanceof Date
                        ? trip.StartsAt.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
                        : new Date(trip.StartsAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                </Chip>
            </div >

            {/* Countdown to trip start: only show if less than 1 hour remains */}
            {
                (() => {
                    const now = new Date();
                    const start = new Date(trip.StartsAt);
                    const diffMs = start.getTime() - now.getTime();
                    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                    const diffMinutes = Math.floor((diffMs / (1000 * 60)) % 60);
                    if (diffMs > 0 && (diffHours > 0 || diffMinutes > 0)) {
                        return (
                            <div className="flex flex-col items-center mt-1 mb-2">
                                <Chip size="md" color="warning" variant="flat" >
                                    {diffHours > 0 && <span>{diffHours} ساعت </span>}
                                    {diffMinutes > 0 && <span>{diffMinutes} دقیقه </span>}
                                    <span>تا شروع سفر</span>
                                </Chip>
                            </div>
                        );
                    }
                    return null;
                })()
            }
            <Divider className='mb-5' />

            {/* Hide passenger info and location/map cards if trip is canceled */}
            {trip.status !== 'canceled' && (
                <>
                    <Card className="mx-2" dir="rtl">
                        <CardBody>
                            <div className="flex justify-between ">
                                <Icon icon="fluent-color:person-20" className='self-center align-middle' width={32}></Icon>
                                <div className="flex flex-col items-start flex-1 ms-4">
                                    <span>
                                        {trip.Passenger?.Firstname} {trip.Passenger?.Lastname}
                                    </span>
                                    <span className="text-xs mt-1 text-blue-500">
                                        <span className="text-default-600 me-1">
                                            شماره تماس:
                                        </span>
                                        {trip.Passenger?.NumberPhone}
                                    </span>
                                </div>
                                {/* Call button */}
                                <a
                                    href={`tel:${trip.Passenger?.NumberPhone ?? ''}`}
                                    className="size-10 align-middle me-2"
                                    tabIndex={-1}
                                    aria-label="تماس با مسافر"
                                >
                                    <Button isIconOnly={true} variant="bordered" className="size-10 me-2 bg-default-50 shadow-2xl align-middle">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 text-green-700">
                                            <path fillRule="evenodd" d="M1.5 4.5a3 3 0 0 1 3-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 0 1-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 0 0 6.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 0 1 1.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 0 1-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5Z" clipRule="evenodd" />
                                        </svg>
                                    </Button>
                                </a>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="mx-2 mt-4 p-1.5" dir="rtl">
                        <CardHeader>
                            <span className="font-md text-default-700">موقعیت مبدا مسافر</span>
                        </CardHeader>
                        <CardBody className="gap-1" >
                            <div className="flex flex-col gap-3" dir="rtl">
                                {trip.Location && typeof trip.Location.Latitude === 'number' && typeof trip.Location.Longitude === 'number' ? (
                                    <PassengerMap latitude={trip.Location.Latitude} longitude={trip.Location.Longitude} />
                                ) : (
                                    <span className="text-default-500 text-center">موقعیت مکانی ثبت نشده است.</span>
                                )}
                            </div>
                            <div>
                                <div className="flex justify-between mt-2" dir="rtl">
                                    <textarea
                                        className="w-full mx-1 text-sm text-default-700 bg-default-100 rounded-lg border border-default-200 p-2 resize-none"
                                        rows={2}
                                        value={typeof trip.Location?.TextAddress === 'string' ? trip.Location.TextAddress : 'آدرس ثبت نشده است.'}
                                        disabled
                                        readOnly
                                        style={{ direction: 'rtl' }}
                                    />
                                </div>
                            </div>
                            {/* Direction Button at the bottom of the card */}
                            {trip.Location && typeof trip.Location.Latitude === 'number' && typeof trip.Location.Longitude === 'number' && (
                                <Button startContent={(
                                    <Icon icon="solar:route-outline" className="" width={24} />
                                )} className="w-full mt-3 px-3 font-md" color="primary" variant="solid" onClick={onOpen} size="lg">
                                    مسیریابی
                                </Button>
                            )}
                        </CardBody>
                    </Card>
                </>
            )}

            <Drawer isOpen={isOpen} placement={"buttom"} onOpenChange={onOpenChange} dir="rtl">
                <DrawerContent>
                    {(onClose) => (
                        <>
                            <DrawerHeader className="flex flex-col gap-1">مسیریابی</DrawerHeader>
                            <DrawerBody className="mt-3">
                                <div className="flex justify-around flex-wrap gap-3">
                                    <div className="flex flex-col items-center">
                                        <Button size="lg" isIconOnly={true} variant='bordered' onPress={() => handleDirection('neshan', onClose)}>
                                            <Image src="/neshanlogo.png" height={41} width={41} alt="Neshan Logo" className="mx-auto" />
                                        </Button>
                                        <p className="text-center mt-2 font-md text-sm">نشان</p>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <Button className='rounded-2xl' size="lg" variant='light' isIconOnly={true} onPress={() => handleDirection('waze', onClose)}>
                                            <NeshanLogo size={44} className="mx-auto" />
                                        </Button>
                                        <p className="text-center mt-2 font-md text-sm">waze</p>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <Button size="lg" variant='bordered' isIconOnly={true} onPress={() => handleDirection('google', onClose)}>
                                            <GoogleMapsLogo size={34} className="mx-auto" />
                                        </Button>
                                        <p className="text-center mt-2 font-md text-sm">گوگل‌مپس</p>
                                    </div>
                                </div>
                            </DrawerBody>
                            <DrawerFooter>
                                <Button className='w-full' color="danger" variant="light" onPress={onClose}>
                                    بستن
                                </Button>
                            </DrawerFooter>
                        </>
                    )}
                </DrawerContent>
            </Drawer>
        </div>
    );
}

export default TripPage;