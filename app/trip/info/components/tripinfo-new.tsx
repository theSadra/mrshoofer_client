"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Card, CardBody } from "@heroui/card";
import { Image } from "@heroui/image";
import { Chip } from "@heroui/chip";

import LocationEditModal from "@/components/onboarding/LocationEditModal";
import { formatTehranDateTime } from "@/lib/format-date";

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

function TripInfo({ trip }) {
  const [showOriginEditModal, setShowOriginEditModal] = useState(false);
  const [showDestinationEditModal, setShowDestinationEditModal] =
    useState(false);

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

  const handleOriginClick = () => {
    if (originSelected) {
      setShowOriginEditModal(true);

      return;
    }
    // Navigate to location selector
    window.location.href = `/location/${trip?.SecureToken}?selection=origin`;
  };

  const handleDestinationClick = () => {
    if (!originSelected) return;
    if (destinationSelected) {
      setShowDestinationEditModal(true);

      return;
    }
    // Navigate to location selector
    window.location.href = `/location/${trip?.SecureToken}?selection=destination`;
  };

  const handleConfirmOriginEdit = () => {
    window.location.href = `/location/${trip?.SecureToken}?selection=origin`;
  };

  const handleConfirmDestinationEdit = () => {
    window.location.href = `/location/${trip?.SecureToken}?selection=destination`;
  };

  const driver = trip?.Driver ?? null;
  const driverFullName = driver
    ? [driver.Firstname, driver.Lastname].filter(Boolean).join(" ")
    : "";
  const driverCarName = driver?.CarName || trip?.CarName || "نامشخص";

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
        whileHover={driver ? { y: -2 } : {}}
      >
        <Card className="shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl border border-slate-200 overflow-hidden">
          <CardBody className="p-4">
            {driver ? (
              // Driver Selected
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <motion.div
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 text-right space-y-1"
                    initial={{ opacity: 0, x: -20 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-[11px] text-gray-500">راننده</p>
                    <p className="font-bold text-lg text-gray-900">
                      {driverFullName || "بدون نام"}
                    </p>
                  </motion.div>
                  <motion.div
                    animate={{ scale: 1 }}
                    className="flex-shrink-0"
                    initial={{ scale: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 220,
                      damping: 16,
                      delay: 0.3,
                    }}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600 flex items-center justify-center shadow-md ring-2 ring-blue-100">
                      <Icon
                        className="text-white"
                        icon="solar:user-check-bold-duotone"
                        width={24}
                      />
                    </div>
                  </motion.div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 shadow-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Icon
                        icon="solar:steering-wheel-bold-duotone"
                        width={18}
                      />
                      <span className="text-[11px]">خودرو</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {driverCarName}
                    </p>
                  </div>

                  {driver.PhoneNumber && (
                    <motion.a
                      className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/60 px-3 py-2 shadow-sm"
                      href={`tel:${driver.PhoneNumber}`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-2 text-blue-500">
                        <Icon
                          icon="solar:phone-calling-rounded-bold-duotone"
                          width={18}
                        />
                        <span className="text-[11px]">تماس</span>
                      </div>
                      <p
                        className="text-sm font-semibold text-gray-900"
                        dir="ltr"
                      >
                        {driver.PhoneNumber}
                      </p>
                    </motion.a>
                  )}
                </div>
              </div>
            ) : (
              // No Driver Selected - Loading State
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  className="flex-shrink-0"
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shadow-sm">
                    <Icon
                      className="text-amber-600"
                      icon="solar:refresh-circle-bold-duotone"
                      width={28}
                    />
                  </div>
                </motion.div>
                <div className="flex-1 text-right space-y-1">
                  <p className="font-bold text-sm text-gray-800">
                    درحال انتخاب راننده هستیم
                  </p>
                  <p className="text-[11px] leading-relaxed text-gray-600">
                    درحال انتخاب بهترین رانندگانمون برای شما هستیم و پس از
                    انتخاب، اطلاعات راننده در این قسمت نمایش خواهد داده شد.
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
