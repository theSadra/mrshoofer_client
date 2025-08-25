"use client";

import React from 'react';
import { Trip, Passenger, Driver } from '@prisma/client';
import { Button, useDisclosure, Image, Divider, Popover, PopoverTrigger, PopoverContent } from '@heroui/react';
import TripInfo from './tripinfo';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';
import { Icon } from "@iconify/react";
import CountdownTimer from './CountdownTimer';
import dynamic from 'next/dynamic';

import DirectionSheet from './DirectionSheet';
import NeshanLogo from './NeshanLogo';
import GoogleMapsLogo from './GoogleMapsLogo';
import WelcomeDriverModal from './modals/WelcomeDriverModal';

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

    // Ensure driver page exclusion from location selector styles
    React.useEffect(() => {
        document.body.setAttribute('data-driver-page', 'true');
        document.body.classList.add('driver-page');

        return () => {
            document.body.removeAttribute('data-driver-page');
            document.body.classList.remove('driver-page');
        };
    }, []);

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

    // Helper to open navigation app with correct URL and close popover
    const handleDirection = (platform: 'neshan' | 'google' | 'waze' | 'balad') => {
        if (!trip.Location || typeof trip.Location.Latitude !== 'number' || typeof trip.Location.Longitude !== 'number') return;
        const lat = trip.Location.Latitude;
        const lng = trip.Location.Longitude;
        let url = '';
        switch (platform) {
            case 'neshan':
                url = `https://nshn.ir/?lat=${lat}&lng=${lng}`;
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
    };

    return (
        <div dir="rtl" data-driver-page="true">
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
                    {trip && trip.StartsAt ? (
                        trip.StartsAt instanceof Date
                            ? trip.StartsAt.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
                            : new Date(trip.StartsAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })
                    ) : (
                        "نامشخص"
                    )}
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

            <h1 className="text-xl ms-5 font-semibold " >
                اطلاعات مسافر
            </h1>

            <Card className="mx-2 mt-4" dir="rtl">
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
                    <span className="font-md text-default-900">
                        <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} className='inline me-1' viewBox="0 0 16 16"><g fill="none"><path fill="url(#SVGyspx1cjV)" d="M14 12.5C14 14 11.314 15 8 15s-6-1-6-2.5S4.686 10 8 10s6 1 6 2.5"></path><path fill="url(#SVGLx4gDddK)" d="M8 1a5 5 0 0 0-5 5c0 1.144.65 2.35 1.393 3.372c.757 1.043 1.677 1.986 2.346 2.62a1.824 1.824 0 0 0 2.522 0c.669-.634 1.589-1.577 2.346-2.62C12.349 8.35 13 7.144 13 6a5 5 0 0 0-5-5"></path><path fill="url(#SVGd9SP9cVI)" d="M9.5 6a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0"></path><defs><linearGradient id="SVGLx4gDddK" x1={0.813} x2={8.969} y1={-2.285} y2={10.735} gradientUnits="userSpaceOnUse"><stop stopColor="#f97dbd"></stop><stop offset={1} stopColor="#d7257d"></stop></linearGradient><linearGradient id="SVGd9SP9cVI" x1={6.674} x2={8.236} y1={6.133} y2={7.757} gradientUnits="userSpaceOnUse"><stop stopColor="#fdfdfd"></stop><stop offset={1} stopColor="#fecbe6"></stop></linearGradient><radialGradient id="SVGyspx1cjV" cx={0} cy={0} r={1} gradientTransform="matrix(9.42857 -1.66667 .69566 3.93547 7.571 11.667)" gradientUnits="userSpaceOnUse"><stop stopColor="#7b7bff"></stop><stop offset={0.502} stopColor="#a3a3ff"></stop><stop offset={1} stopColor="#ceb0ff"></stop></radialGradient></defs></g></svg>
                        موقعیت مبدا
                    </span>
                </CardHeader>
                <CardBody className="gap-1" >
                    <div className="flex flex-col gap-3" dir="rtl">
                        {trip.Location && typeof trip.Location.Latitude === 'number' && typeof trip.Location.Longitude === 'number' ? (
                            <PassengerMap latitude={trip.Location.Latitude} longitude={trip.Location.Longitude} />
                        ) : (
                            <span className="text-default-500 mb-3 text-center">موقعیت مکانی هنوز ثبت نشده است.</span>
                        )}
                    </div>
                    <div>
                        <div className="mt-2" dir="rtl">


                            <p className="font-light text-xs text-right pb-2">
                                آدرس مبدا
                            </p>
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
                        <Popover placement="top" isOpen={isOpen} onOpenChange={onOpenChange}>
                            <PopoverTrigger>


                                <Button endContent={(
                                    <Icon icon="solar:route-outline" className="" width={24} />
                                )} className="w-full mt-3 px-3 font-md" color="primary" variant="solid" size="lg">
                                    مسیریابی
                                </Button>

                            </PopoverTrigger>
                            <PopoverContent dir="rtl" className="p-4">
                                <div className="flex flex-col gap-3">
                                    <h4 className="text-sm font-semibold mb-2">انتخاب برنامه مسیریابی</h4>
                                    <div className="flex justify-around gap-4">
                                        <div className="flex flex-col items-center">
                                            <Button
                                                size="md"
                                                isIconOnly={true}
                                                variant='bordered'
                                                onPress={() => handleDirection('neshan')}
                                                className="w-12 h-12" z
                                            >
                                                <Image src="/neshanlogo.png" height={39} width={39} alt="Neshan Logo" className="object-contain" />
                                            </Button>
                                            <p className="text-center mt-1 text-xs">نشان</p>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <Button
                                                size="md"
                                                isIconOnly={true}
                                                variant='bordered'
                                                onPress={() => handleDirection('waze')}
                                                className="w-12 h-12"
                                            >
                                                <Image src="/wazelogo.png" height={34} width={34} alt="Waze Logo" className="object-contain" />
                                            </Button>
                                            <p className="text-center mt-1 text-xs">waze</p>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <Button
                                                size="md"
                                                variant='bordered'
                                                isIconOnly={true}
                                                onPress={() => handleDirection('google')}
                                                className="w-12 h-12"
                                            >
                                                <GoogleMapsLogo size={34} className="object-contain" />
                                            </Button>
                                            <p className="text-center mt-1 text-xs">گوگل‌مپس</p>
                                        </div>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}


                    <div className="text-xs px-3 font-light text-center color-gray-700 mt-1">

                        <span className='text-danger-400 me-1'>*</span>
                        برای مشاهده مقصد دقیق مسافر و مسیریابی، از گزینه بالا استفاده کنید.
                    </div>

                </CardBody>
            </Card>


            <WelcomeDriverModal tripId={trip.id.toString()} />
        </div >
    );
}


export default TripPage;