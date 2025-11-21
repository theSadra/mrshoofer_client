"use client";

import React from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

import { useTripContext } from "@/app/(trip-flow)/onboarding/trip-context";
import { formatTehranDateTime } from "@/lib/format-date";

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

const statusCopy: Record<string, string> = {
  wating_info: "در انتظار تکمیل اطلاعات",
  wating_location: "در انتظار مبدا/مقصد",
  wating_start: "منتظر شروع سفر",
  intrip: "سفر در حال انجام است",
  done: "سفر انجام شد",
  canceled: "سفر لغو شده",
};

export default function OnboardingStep2() {
  const { tripData, isLoading } = useTripContext();

  const schedule = formatTehranDateTime(tripData?.StartsAt ?? null);
  const scheduleTime = schedule?.time || "زمان نامشخص";
  const scheduleDate = schedule?.date || "تاریخ تعیین نشده";
  const scheduleWeekday = schedule?.weekday || "";
  const passengerName = tripData?.Passenger
    ? `${tripData.Passenger.Firstname} ${tripData.Passenger.Lastname}`
    : "مسافر ثبت نشده";
  const passengerPhone = tripData?.Passenger?.NumberPhone ?? "—";
  const driverName = tripData?.Driver
    ? `${tripData.Driver.Firstname} ${tripData.Driver.Lastname}`
    : "در انتظار تخصیص";
  const driverPhone = tripData?.Driver?.PhoneNumber ?? "—";
  const driverCar = tripData?.Driver?.CarName ?? tripData?.CarName ?? "نامشخص";

  const originCity = tripData?.OriginCity || "مبدا نامشخص";
  const destinationCity = tripData?.DestinationCity || "مقصد نامشخص";
  const originAddress =
    tripData?.OriginLocation?.TextAddress ||
    tripData?.OriginLocation?.Description ||
    "در انتظار ثبت آدرس دقیق";
  const destinationAddress =
    tripData?.DestinationLocation?.TextAddress ||
    tripData?.DestinationLocation?.Description ||
    "در انتظار ثبت آدرس دقیق";

  const routePoints = [
    {
      label: "مبدا",
      city: originCity,
      address: originAddress,
      accentBg: "bg-primary/10",
      accentText: "text-primary-600",
    },
    {
      label: "مقصد",
      city: destinationCity,
      address: destinationAddress,
      accentBg: "bg-emerald-50",
      accentText: "text-emerald-500",
    },
  ];

  const factBlocks = [
    {
      label: "نوع سرویس",
      value: tripData?.ServiceName || "سرویس تعیین نشده",
      icon: "solar:bag-3-line-duotone",
    },
    {
      label: "کد پیگیری",
      value: tripData?.TicketCode || "—",
      icon: "solar:ticket-linear",
    },
    {
      label: "خودرو پیشنهادی",
      value: driverCar,
      icon: "solar:car-line-duotone",
    },
    {
      label: "کد سفر",
      value: tripData?.TripCode || "پس از تایید اعلام می‌شود",
      icon: "solar:bookmark-square-linear",
    },
  ];

  const passengerBlocks = [
    {
      title: "مسافر",
      name: passengerName,
      phone: passengerPhone,
      icon: "solar:user-heart-line-duotone",
    },
    {
      title: "راننده",
      name: driverName,
      phone: driverPhone,
      icon: "solar:steering-wheel-line-duotone",
      muted: !tripData?.Driver,
    },
  ];

  const statusLabel =
    (tripData?.status && statusCopy[tripData.status]) || "وضعیت در دسترس نیست";

  return (
    <motion.div
      animate="visible"
      className="relative flex h-full min-h-[60vh] flex-col gap-4 rounded-3xl px-3 py-2 text-right sm:gap-6 sm:px-6 sm:py-6"
      initial="hidden"
      variants={contentVariants}
    >
      <div className="mx-auto flex h-full w-full max-w-3xl justify-around gap-7 flex-1 flex-col px-1.5 py-2 sm:px-4 sm:py-3">
        <motion.div
          className="w-full max-w-full self-center rounded-[26px] border border-white/60 bg-white/80 px-4 py-4 sm:px-5 sm:py-5 shadow-[0_12px_28px_rgba(15,23,42,0.08)] backdrop-blur text-right"
          variants={itemVariants}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] sm:text-xs font-semibold text-primary-600">
                <span className="inline-block h-2 w-2 rounded-full bg-primary-500" />
                خلاصه سفر
              </span>
              <span className="text-[11px] sm:text-xs text-slate-400 font-medium">
                {tripData ? "اطلاعات کامل ✅" : "در حال بارگذاری..."}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              🚕 اطلاعات سفر شما
            </h1>
            <p className="text-[12px] sm:text-sm leading-5 text-slate-600">
              جزئیات کامل مسیر، زمان و اطلاعات تماس
            </p>
          </div>
        </motion.div>

        <motion.div
          className="mx-auto grid w-full max-w-full gap-3 sm:gap-4"
          variants={itemVariants}
        >
          <div className="space-y-3">
            {/* Road with Taxi */}
            <div className="relative flex items-center justify-center py-3">
              <div className="absolute inset-x-0 flex items-center">
                <div className="w-full h-6 bg-slate-700 rounded-lg relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full border-t-2 border-dashed border-white" />
                  </div>
                </div>
              </div>
              <div className="relative z-10">
                <span className="text-3xl inline-block">🚕</span>
              </div>
            </div>

            {/* Direction Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md">
              <div className="space-y-2.5">
                {/* Origin */}
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-lg">
                    📍
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-slate-400 mb-0.5">مبدا</p>
                    <p className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {originCity}
                    </p>
                    <p className="text-[12px] sm:text-[13px] text-slate-500 line-clamp-1">
                      {originAddress}
                    </p>
                  </div>
                </div>

                {/* Connecting Line */}
                <div className="mr-4 h-4 w-0.5 bg-gradient-to-b from-green-300 to-blue-300" />

                {/* Destination */}
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg">
                    🎯
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-slate-400 mb-0.5">مقصد</p>
                    <p className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {destinationCity}
                    </p>
                    <p className="text-[12px] sm:text-[13px] text-slate-500 line-clamp-1">
                      {destinationAddress}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Date/Time and Trip Type Cards */}
            <div className="grid grid-cols-2 gap-3">
              {/* Date/Time Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <Icon
                    className="text-primary-500"
                    icon="solar:calendar-bold-duotone"
                    width={18}
                  />
                  <p className="text-[11px] text-slate-500 font-semibold">
                    زمان حرکت
                  </p>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <p className="text-[10px] text-slate-400">تاریخ</p>
                    <p className="text-[12px] sm:text-[13px] text-slate-700 font-semibold">
                      {scheduleWeekday && `${scheduleWeekday}، `}
                      {scheduleDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">ساعت</p>
                    <p className="text-base sm:text-lg font-bold text-slate-900">
                      {scheduleTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Trip Type & Car Card */}
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 shadow-sm transition-all duration-300 hover:shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <Icon
                    className="text-blue-500"
                    icon="solar:car-bold-duotone"
                    width={18}
                  />
                  <p className="text-[11px] text-slate-500 font-semibold">
                    نوع سرویس
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm sm:text-base font-bold text-slate-900">
                      {tripData?.ServiceName || "سرویس نامشخص"}
                    </p>
                    {(tripData?.ServiceName?.toUpperCase().includes("VIP") ||
                      tripData?.ServiceName?.includes("وی‌آی‌پی") ||
                      tripData?.ServiceName?.includes("ویژه")) && (
                      <div className="flex items-center gap-0.5">
                        <Icon icon="fluent-color:star-16" width={16} />
                        <Icon icon="fluent-color:star-16" width={16} />
                        <Icon icon="fluent-color:star-16" width={16} />
                      </div>
                    )}
                  </div>
                  <p className="text-[12px] sm:text-[13px] text-slate-600 font-medium">
                    {driverCar}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {!tripData && !isLoading && (
          <div className="rounded-2xl border border-amber-100 bg-amber-50/80 px-3.5 py-2.5 text-sm sm:text-base text-amber-700">
            هنوز اطلاعات سفری برای نمایش نداریم. لطفاً کد پیگیری معتبر وارد کنید
            یا کمی بعد دوباره تلاش کنید.
          </div>
        )}
      </div>
    </motion.div>
  );
}
