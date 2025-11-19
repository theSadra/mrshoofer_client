"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Card, CardBody } from "@heroui/card";
import { Image } from "@heroui/image";

import LocationEditModal from "./LocationEditModal";

import { useTripContext } from "@/contexts/TripContext";
const contentVariants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const titleVariants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};
const cardVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 25,
  },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 150,
      damping: 18,
      delay: 0.3 + i * 0.2,
    },
  }),
};

export default function OnboardingStep4({ onSelectLocation }) {
  const [isOpeningOriginMap, setIsOpeningOriginMap] = useState(false);
  const [isOpeningDestinationMap, setIsOpeningDestinationMap] = useState(false);
  const [showOriginEditModal, setShowOriginEditModal] = useState(false);
  const [showDestinationEditModal, setShowDestinationEditModal] =
    useState(false);

  const { tripData } = useTripContext();
  const selectLocation = onSelectLocation || (() => {});

  const typedTripData = tripData;
  const originInfo = typedTripData?.OriginLocation;
  const destinationInfo = typedTripData?.DestinationLocation;
  const originSelected = Boolean(originInfo?.Latitude && originInfo?.Longitude);
  const destinationSelected = Boolean(
    destinationInfo?.Latitude && destinationInfo?.Longitude,
  );

  const originSubtitle = originSelected
    ? originInfo?.TextAddress || "موقعیت مبدا ثبت شد"
    : "ابتدا مبدا را انتخاب کنید";
  const destinationSubtitle = destinationSelected
    ? destinationInfo?.TextAddress || "موقعیت ثبت شد"
    : "انتخاب مقصد";

  const handleOriginClick = () => {
    if (originSelected) {
      // Show confirmation modal for editing
      setShowOriginEditModal(true);

      return;
    }
    // First time selection - open map directly
    setIsOpeningOriginMap(true);
    selectLocation("origin");
  };

  const handleDestinationClick = () => {
    if (!originSelected) {
      // Cannot select destination without origin
      return;
    }
    if (destinationSelected) {
      // Show confirmation modal for editing
      setShowDestinationEditModal(true);

      return;
    }
    // First time selection - open map directly
    setIsOpeningDestinationMap(true);
    selectLocation("destination");
  };

  const handleConfirmOriginEdit = () => {
    setIsOpeningOriginMap(true);
    selectLocation("origin");
  };

  const handleConfirmDestinationEdit = () => {
    setIsOpeningDestinationMap(true);
    selectLocation("destination");
  };

  return (
    <motion.div
      animate="visible"
      className="relative flex h-full min-h-[60vh] flex-col gap-4 rounded-3xl px-3 py-2 text-right sm:gap-6 sm:px-6 sm:py-6"
      initial="hidden"
      variants={contentVariants}
    >
      <div className="mx-auto flex h-full w-full max-w-3xl justify-around gap-7 flex-1 flex-col px-1.5 py-2  sm:px-4 sm:py-3">
        {/* Header / status */}
        <motion.div
          className="w-full max-w-full self-center rounded-[26px] border border-white/60 bg-white/80 px-3.5 py-3.5 sm:px-5 sm:py-4 shadow-[0_12px_28px_rgba(15,23,42,0.08)] backdrop-blur text-right"
          variants={titleVariants}
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] sm:text-xs font-semibold text-primary-600">
                <span className="inline-block h-2 w-2 rounded-full bg-primary-500" />
               مبدا و مقصد
              </span>
              <span className="text-[11px] sm:text-xs text-slate-400 font-medium">
                {originSelected && destinationSelected
                  ? "همه چیز آمادست ✅"
                  : originSelected
                    ? "مقصد را تکمیل کنید"
                    : "مبدا را تعیین کنید"}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              🧭 مبدا و مقصد را دقیق مشخص کنید
            </h1>
            <p className="text-[12px] sm:text-sm leading-5 px-2 text-slate-600">
              به منظور تکمیل اطلاعات سفر شما، نیاز داریم که مکان دقیق مبدا و مقصد خود را به منظور حضور یافتن تاکسی در آن مکان، مشخص نمایید
            </p>
          </div>
        </motion.div>

        {/* Route Cards Section */}
        <div className="flex w-full flex-1 flex-col justify-center">
          <motion.div
            className="mx-auto grid w-full max-w-full gap-3 sm:gap-4"
            variants={itemVariants}
          >
            {/* Origin Card */}
            <motion.div
              animate={{ height: "auto", scale: 1 }}
              className="relative z-10 w-full"
              custom={1}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOriginClick}
            >
              <Card
                className={`transition-all duration-300 w-full border-1 rounded-2xl shadow-sm ${
                  originSelected
                    ? "border-success-200 bg-white"
                    : "border-primary-200  bg-white"
                }`}
              >
                <CardBody className="transition-all duration-300 px-3.5 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Image
                        alt="Origin"
                        className="transition-all duration-300"
                        src="location-city.png"
                        width={32}
                      />

                      <div className="text-right space-y-1">
                        <p className="font-bold text-sm sm:text-base text-gray-800 flex items-center gap-1">
                          مبدا
                          <span className="text-sm font-bold text-gray-500">
                            ({typedTripData?.OriginCity || "نامشخص"})
                          </span>
                        </p>
                        <p
                          className={`text-[12px] sm:text-[13px] text-gray-700 transition-all duration-300 flex items-center gap-2 ${
                            originSelected ? "font-semibold" : "font-light"
                          }`}
                        >
                          {isOpeningOriginMap ? (
                            <>
                              <span className="inline-block animate-spin rounded-full h-3 w-3 border-2 border-primary-500 border-t-transparent" />
                              <span>در حال بازکردن نقشه...</span>
                            </>
                          ) : (
                            originSubtitle
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Icon
                        className={`transition-all duration-300 ${
                          originSelected
                            ? "text-success-500"
                            : "text-primary-500"
                        }`}
                        icon={
                          originSelected
                            ? "solar:check-circle-bold"
                            : "solar:add-circle-line-duotone"
                        }
                        width={26}
                      />
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
              className="relative z-10"
              custom={1}
              transition={{ type: "spring", stiffness: 250, damping: 15 }}
              variants={cardVariants}
              whileHover={{ scale: originSelected ? 1.02 : 1 }}
              whileTap={{ scale: originSelected ? 0.98 : 1 }}
              onClick={originSelected ? handleDestinationClick : undefined}
            >
              <Card
                className={`border-1 w-full transition-all duration-300 rounded-2xl shadow-sm ${
                  !originSelected
                    ? "border-gray-200 bg-gray-100 opacity-70 cursor-not-allowed"
                    : destinationSelected
                      ? "border-success-200 bg-white"
                      : "border-gray-300 border-2 border-dashed bg-white"
                }`}
              >
                <CardBody className="px-3.5 py-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Image
                        alt="Destination"
                        src="location-yard.png"
                        width={32}
                      />

                      <div className="text-right space-y-1">
                        <p className="font-bold text-sm sm:text-base text-gray-800 flex items-center gap-1">
                          مقصد
                          <span className="text-sm font-bold text-gray-500">
                            ({typedTripData?.DestinationCity || "نامشخص"})
                          </span>
                        </p>
                        <p
                          className={`text-[12px] sm:text-[13px] text-gray-700 transition-all duration-300 flex items-center gap-2 ${
                            destinationSelected ? "font-semibold" : "font-light"
                          }`}
                        >
                          {isOpeningDestinationMap ? (
                            <>
                              <span className="inline-block animate-spin rounded-full h-3 w-3 border-2 border-primary-500 border-t-transparent" />
                              <span>در حال بازکردن نقشه...</span>
                            </>
                          ) : originSelected ? (
                            destinationSubtitle
                          ) : (
                            "بعد از انتخاب مبدا فعال می‌شود"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-1">
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
                        width={27}
                      />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="mt-auto w-full max-w-full rounded-2xl border border-dashed border-slate-200/70 bg-white/70 px-3 py-2.5 text-[12px] text-slate-500 sm:text-sm"
          variants={itemVariants}
        >
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 font-semibold text-slate-600">
              <Icon
                className="text-primary-500"
                icon="solar:hand-heart-line-duotone"
                width={16}
              />
              نکته سریع
            </div>
            <p className="leading-relaxed">
              اگر در طول تماس با پشتیبانی هستید، آدرس دقیق‌تر باعث می‌شود اولین
              راننده سریع‌تر به شما برسد.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Edit Confirmation Modals */}
      <LocationEditModal
        isOpen={showOriginEditModal}
        locationAddress={originInfo?.TextAddress}
        locationType="origin"
        onClose={() => setShowOriginEditModal(false)}
        onConfirm={handleConfirmOriginEdit}
      />
      <LocationEditModal
        isOpen={showDestinationEditModal}
        locationAddress={destinationInfo?.TextAddress}
        locationType="destination"
        onClose={() => setShowDestinationEditModal(false)}
        onConfirm={handleConfirmDestinationEdit}
      />
    </motion.div>
  );
}
