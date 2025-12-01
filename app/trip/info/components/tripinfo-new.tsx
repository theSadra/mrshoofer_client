"use client";

import React, { useEffect, useState } from "react";
import { Prisma } from "@prisma/client";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Card, CardBody } from "@heroui/card";
import { Image } from "@heroui/image";
import { Chip } from "@heroui/chip";

import LocationEditModal from "@/components/onboarding/LocationEditModal";
import { formatTehranDateTime } from "@/lib/format-date";

type TripWithRelations = Prisma.TripGetPayload<{
  include: {
    Location: true;
    Passenger: true;
    Driver: true;
    OriginLocation: true;
    DestinationLocation: true;
  };
}>;

const contentVariants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1], // Custom easing for smooth effect
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const cardHoverVariants = {
  rest: {
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.15,
    },
  },
};

function TripInfo({ trip }: { trip: TripWithRelations | null }) {
  const [showOriginEditModal, setShowOriginEditModal] = useState(false);
  const [showDestinationEditModal, setShowDestinationEditModal] =
    useState(false);
  const [displayDriver, setDisplayDriver] = useState(trip?.Driver ?? null);

  const schedule = formatTehranDateTime(trip?.StartsAt ?? null);
  const scheduleTime = schedule?.time || "زمان نامشخص";
  const scheduleDate = schedule?.date || "تاریخ تعیین نشده";
  const scheduleWeekday = schedule?.weekday || "";

  const originCity = trip?.OriginCity || "مبدا نامشخص";
  const destinationCity = trip?.DestinationCity || "مقصد نامشخص";
  const originAddress =
    trip?.OriginLocation?.TextAddress ||
    trip?.OriginLocation?.Description ||
    "در انتظار ثبت آدرس دقیق";
  const destinationAddress =
    trip?.DestinationLocation?.TextAddress ||
    trip?.DestinationLocation?.Description ||
    "در انتظار ثبت آدرس دقیق";

  const originSelected = Boolean(
    trip?.OriginLocation?.Latitude && trip?.OriginLocation?.Longitude,
  );
  const destinationSelected = Boolean(
    trip?.DestinationLocation?.Latitude && trip?.DestinationLocation?.Longitude,
  );

  const navigateToLocationSelector = (selection: "origin" | "destination") => {
    if (!trip?.SecureToken) {
      return;
    }

    const params = new URLSearchParams();
    params.set("selection", selection);

    window.location.href = `/location/${trip.SecureToken}?${params.toString()}`;
  };

  const handleOriginClick = () => {
    if (originSelected) {
      setShowOriginEditModal(true);

      return;
    }
    navigateToLocationSelector("origin");
  };

  const handleDestinationClick = () => {
    if (!originSelected) return;
    if (destinationSelected) {
      setShowDestinationEditModal(true);

      return;
    }
    navigateToLocationSelector("destination");
  };

  const handleConfirmOriginEdit = () => {
    navigateToLocationSelector("origin");
  };

  const handleConfirmDestinationEdit = () => {
    navigateToLocationSelector("destination");
  };

  const hasDriverAssigned = Boolean(trip?.driverId);
  const driverFullName = displayDriver
    ? [displayDriver.Firstname, displayDriver.Lastname]
        .filter(Boolean)
        .join(" ")
    : "";
  const driverCarName = displayDriver?.CarName || trip?.CarName || "نامشخص";

  useEffect(() => {
    if (!trip) {
      setDisplayDriver(null);

      return;
    }

    if (trip.Driver) {
      setDisplayDriver(trip.Driver);

      return;
    }

    if (!trip.driverId) {
      setDisplayDriver(null);
    }
  }, [trip?.Driver, trip?.driverId, trip?.SecureToken, trip?.id]);

  return (
    <motion.div
      animate="visible"
      className="relative flex flex-col gap-5 text-right sm:gap-6"
      initial="hidden"
      variants={contentVariants}
    >
      {/* Trip Overview Card - Keep exact same layout, just update styling */}
      <motion.div
        className="w-full rounded-3xl border border-slate-200 bg-white p-5 shadow-lg hover:shadow-xl transition-shadow duration-300 sm:p-6"
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        variants={itemVariants}
        whileHover={{ y: -2 }}
      >
        {/* Header with reference */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            اطلاعات سفر
          </h1>
          <Chip className="font-semibold" color="default" variant="bordered">
            <span className="text-xs">رفرنس {trip?.TicketCode}</span>
          </Chip>
        </div>

        {/* Origin and Destination */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
          initial={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between px-0 mb-3">
            <motion.span
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-slate-500 font-medium"
              initial={{ opacity: 0, x: -10 }}
              transition={{ delay: 0.3 }}
            >
              📍 مبدا
            </motion.span>
            <motion.span
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-slate-500 font-medium"
              initial={{ opacity: 0, x: 10 }}
              transition={{ delay: 0.3 }}
            >
              📍 مقصد
            </motion.span>
          </div>

          <div className="flex items-center justify-between px-2 py-2 bg-gradient-to-r from-blue-50/50 via-transparent to-purple-50/50 rounded-xl">
            <motion.span
              className="text-base sm:text-lg font-bold text-slate-900"
              whileHover={{ scale: 1.05 }}
            >
              {originCity}
            </motion.span>
            <motion.span
              animate={{ x: [0, 3, 0] }}
              className="text-gray-400 text-sm"
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              ......<span className="text-xl">🚕</span>......
            </motion.span>
            <motion.span
              className="text-base sm:text-lg font-bold text-slate-900"
              whileHover={{ scale: 1.05 }}
            >
              {destinationCity}
            </motion.span>
          </div>
        </motion.div>

        <motion.div
          animate={{ scaleX: 1 }}
          className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-5"
          initial={{ scaleX: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        />

        {/* Start Time */}
        <div className="mb-1">
          <span className="text-sm text-slate-600 mb-1 block">شروع سفر</span>

          <div className="flex items-center justify-between">
            {/* Date */}
            <motion.div
              className="flex items-center gap-3"
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              whileHover={{ x: -3 }}
            >
              <motion.div
                className="bg-gradient-to-br from-blue-50 to-blue-100 p-2.5 rounded-xl"
                transition={{ duration: 0.5 }}
                whileHover={{ rotate: [0, -5, 5, -5, 0] }}
              >
                <Icon
                  className="text-blue-500"
                  icon="solar:calendar-bold-duotone"
                  width={30}
                />
              </motion.div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {scheduleWeekday && `${scheduleWeekday}، `}
                  {scheduleDate}
                </p>
                <p className="text-xs text-slate-500">{scheduleWeekday}</p>
              </div>
            </motion.div>

            {/* Time */}
            <motion.div
              className="text-left"
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              whileHover={{ x: 3 }}
            >
              <p className="text-xs font-semibold text-slate-700">🕜 ساعت</p>
              <p className="text-lg font-bold text-slate-900">{scheduleTime}</p>
            </motion.div>
          </div>
        </div>

        <div className="w-full h-px bg-slate-200 my-4" />

        {/* Service and Car */}
        <div className="flex items-center justify-between gap-3">
          <motion.div
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Chip
              className="font-semibold text-sm sm:text-base px-3 py-1"
              color={
                trip?.ServiceName?.toUpperCase().includes("VIP")
                  ? "secondary"
                  : undefined
              }
              variant="shadow"
            >
              <div className="flex items-center gap-1.5">
                {trip?.ServiceName}
                {trip?.ServiceName?.toUpperCase().includes("VIP") && (
                  <motion.div
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-0.5"
                    initial={{ opacity: 0, scale: 0 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    <Icon icon="fluent-color:star-16" width={15} />
                    <Icon icon="fluent-color:star-16" width={15} />
                    <Icon icon="fluent-color:star-16" width={15} />
                  </motion.div>
                )}
              </div>
            </Chip>
          </motion.div>
          <motion.div
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Chip
              className="text-slate-700 font-semibold text-xs sm:text-base px-3 py-1"
              color="primary"
              variant="flat"
            >
              {trip?.CarName}
            </Chip>
          </motion.div>
        </div>
      </motion.div>

      {/* Location Selector Cards - Exact same as OnboardingStep4 */}
      <motion.div className="grid gap-3 sm:gap-4" variants={itemVariants}>
        {/* Origin Card */}
        <motion.div
          animate={{ height: "auto", scale: 1 }}
          className="relative z-10 w-full cursor-pointer"
          initial="rest"
          variants={cardHoverVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={handleOriginClick}
        >
          <Card
            className={`transition-all duration-300 w-full border-1 rounded-2xl ${
              originSelected
                ? "border-success-200 bg-white shadow-md hover:shadow-lg"
                : "border-primary-200 bg-white shadow-md hover:shadow-lg"
            }`}
          >
            <CardBody className="transition-all duration-300 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ opacity: 1, scale: 1 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      alt="Origin"
                      className="transition-all duration-300 drop-shadow-sm"
                      height={32}
                      src="/location-city.png"
                      width={32}
                    />
                  </motion.div>

                  <div className="text-right space-y-1">
                    <p className="font-bold text-sm sm:text-base text-gray-800 flex items-center gap-1">
                      مبدا
                      <span className="text-sm font-bold text-gray-500">
                        ({originCity || "نامشخص"})
                      </span>
                    </p>
                    <p
                      className={`text-[12px] sm:text-[13px] text-gray-700 transition-all duration-300 flex items-center gap-2 ${
                        originSelected ? "font-semibold" : "font-light"
                      }`}
                    >
                      {originSelected
                        ? originAddress
                        : "ابتدا مبدا را انتخاب کنید"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <motion.div
                    animate={
                      originSelected
                        ? {
                            scale: [1, 1.2, 1],
                          }
                        : {}
                    }
                    transition={{
                      duration: 0.5,
                      ease: "easeInOut",
                    }}
                  >
                    <Icon
                      className={`transition-all duration-300 ${
                        originSelected ? "text-success-500" : "text-primary-500"
                      }`}
                      icon={
                        originSelected
                          ? "solar:check-circle-bold"
                          : "solar:add-circle-line-duotone"
                      }
                      width={28}
                    />
                  </motion.div>
                  <span className="text-[10px] sm:text-[11px] text-center text-gray-600 font-medium max-w-[90px] line-clamp-2">
                    {!originSelected && "انتخاب مبدا"}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Destination Card */}
        <motion.div
          className={`relative z-10 ${originSelected ? "cursor-pointer" : "cursor-not-allowed"}`}
          initial="rest"
          variants={cardHoverVariants}
          whileHover={originSelected ? "hover" : "rest"}
          whileTap={originSelected ? "tap" : "rest"}
          onClick={originSelected ? handleDestinationClick : undefined}
        >
          <Card
            className={`border-1 w-full transition-all duration-300 rounded-2xl ${
              !originSelected
                ? "border-gray-200 bg-gray-50 opacity-70 shadow-sm"
                : destinationSelected
                  ? "border-success-200 bg-white shadow-md hover:shadow-lg"
                  : "border-amber-300 border-2 border-dashed bg-white shadow-md hover:shadow-lg"
            }`}
          >
            <CardBody className="transition-all duration-300 px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ opacity: 1, scale: 1 }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <Image
                      alt="Destination"
                      className="drop-shadow-sm transition-all duration-300"
                      height={32}
                      src="/location-yard.png"
                      width={32}
                    />
                  </motion.div>

                  <div className="text-right space-y-1">
                    <p className="font-bold text-sm sm:text-base text-gray-800 flex items-center gap-1">
                      مقصد
                      <span className="text-sm font-bold text-gray-500">
                        ({destinationCity || "نامشخص"})
                      </span>
                    </p>
                    <p
                      className={`text-[12px] sm:text-[13px] text-gray-700 transition-all duration-300 flex items-center gap-2 ${
                        destinationSelected ? "font-semibold" : "font-light"
                      }`}
                    >
                      {originSelected
                        ? destinationSelected
                          ? destinationAddress
                          : "انتخاب مقصد"
                        : "بعد از انتخاب مبدا فعال می‌شود"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <motion.div
                    animate={
                      destinationSelected
                        ? {
                            scale: [1, 1.2, 1],
                          }
                        : originSelected
                          ? {
                              scale: [1, 1.1, 1],
                            }
                          : {}
                    }
                    transition={{
                      duration: 0.5,
                      repeat:
                        !destinationSelected && originSelected ? Infinity : 0,
                      repeatDelay: 1,
                      ease: "easeInOut",
                    }}
                  >
                    <Icon
                      className={
                        destinationSelected
                          ? "text-success-500"
                          : originSelected
                            ? "text-amber-500"
                            : "text-gray-400"
                      }
                      icon={
                        destinationSelected
                          ? "solar:check-circle-bold"
                          : "solar:add-circle-line-duotone"
                      }
                      width={28}
                    />
                  </motion.div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </motion.div>

      {/* Driver Information Card */}
      <motion.div
        className="relative z-10"
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        variants={itemVariants}
        whileHover={displayDriver ? { y: -2 } : {}}
      >
        <Card className="shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl border border-slate-200 overflow-hidden bg-white">
          <CardBody className="p-0">
            {displayDriver ? (
              // Driver Selected
              <div className="flex flex-col">
                {/* Header / Status Bar */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-3 border-b border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-bold text-gray-800">
                      سفیر مسترشوفر
                      (راننده‌ی شما)
                    </span>
                  </div>
                  <Icon
                    className="text-blue-400 text-lg"
                    icon="solar:shield-check-bold-duotone"
                  />
                </div>

                <div className="p-5 flex flex-col gap-5">
                  {/* Driver Profile & Car */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <motion.div
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative"
                        initial={{ scale: 0.8, opacity: 0 }}
                      >
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center shadow-inner border-2 border-white">
                          <Icon
                            className="text-slate-400 text-2xl"
                            icon="solar:user-bold-duotone"
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-white flex items-center justify-center">
                          <Icon
                            className="text-white text-[10px]"
                            icon="solar:check-read-bold"
                          />
                        </div>
                      </motion.div>

                      <div className="space-y-2 text-right">
                        <h3 className="font-black text-base text-slate-800 leading-tight">
                          {driverFullName || "بدون نام"}
                        </h3>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[11px] text-slate-400 font-semibold tracking-wide">
                            مشخصات خودرو
                          </span>
                          <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 shadow-inner">
                            <Icon
                              className="text-xs text-slate-500"
                              icon="solar:steering-wheel-bold-duotone"
                            />
                            <span className="text-[11px] font-bold text-slate-700 max-w-[140px] truncate">
                              {driverCarName}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {displayDriver.PhoneNumber && (
                    <div className="grid grid-cols-1">
                      <motion.a
                        className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl shadow-md shadow-green-200 transition-colors"
                        href={`tel:${displayDriver.PhoneNumber}`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Icon
                          className="text-lg"
                          icon="solar:phone-calling-bold"
                        />
                        <span className="font-bold text-sm">
                          تماس با راننده
                        </span>
                      </motion.a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Searching for Driver
              <div className="p-6 flex flex-col items-center text-center gap-4 bg-gradient-to-b from-amber-50/50 to-transparent">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-200 rounded-full animate-ping opacity-20" />
                  <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center relative z-10">
                    <Icon
                      className="text-amber-600 text-3xl animate-spin"
                      icon="solar:radar-2-bold-duotone"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-800">
                    در حال انتخاب سفیر
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
                    ما در حال تخصیص بهترین سفیر و خودرو از میان خودروهای فعال
                    هستیم.
                    <span className="block mt-1">
                      سفیر مسترشوفر، پس از تخصیص سفر با شما تماس خواهد گرفت.
                    </span>
                  </p>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>

      {/* Modals */}
      <LocationEditModal
        isOpen={showOriginEditModal}
        locationType="origin"
        onClose={() => setShowOriginEditModal(false)}
        onConfirm={handleConfirmOriginEdit}
      />
      <LocationEditModal
        isOpen={showDestinationEditModal}
        locationType="destination"
        onClose={() => setShowDestinationEditModal(false)}
        onConfirm={handleConfirmDestinationEdit}
      />
    </motion.div>
  );
}

export default TripInfo;
