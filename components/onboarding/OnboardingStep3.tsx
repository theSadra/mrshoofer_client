"use client";

import React from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

import { useTripContext } from "@/app/(trip-flow)/trip-context";

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
      staggerChildren: 0.15,
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

const checkIconVariants = {
  hidden: {
    scale: 0,
    rotate: -180,
  },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      delay: 0.4,
    },
  },
};

function getCallTimeText(startTime) {
  if (!startTime) return "به زودی";

  const now = new Date();
  const tripStart = new Date(startTime);
  const deltaHours = (tripStart.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (deltaHours < 1) {
    return "تا دقایقی دیگر";
  } else if (deltaHours < 5) {
    return "به زودی";
  } else if (deltaHours < 8) {
    return "تا ساعتی قبل از سفر";
  } else {
    return "تا ساعاتی قبل از شروع سفر";
  }
}

export default function OnboardingStep3() {
  const { tripData } = useTripContext();
  const callTimeText = getCallTimeText(tripData?.StartsAt);

  return (
    <motion.div
      animate="visible"
      className="relative flex h-full min-h-[60vh] flex-col gap-3 rounded-3xl px-2 sm:px-4 py-0 text-right"
      initial="hidden"
      variants={contentVariants}
    >
      <div className="mx-auto flex h-full w-full justify-around gap-4 flex-1 flex-col px-1 py-1 sm:px-2.5">
        {/* Header Card */}
        <div className="my-2" />
        {/* Success Icon and Message */}
        <motion.div
          className="flex flex-col items-center justify-center flex-1 gap-4"
          variants={itemVariants}
        >
          <motion.div className="relative" variants={checkIconVariants}>
            <div className="absolute inset-0 animate-ping rounded-full bg-success-200 opacity-75" />
            <div className="relative flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-full bg-gradient-to-br from-success-400 to-success-600 shadow-2xl">
              <Icon
                className="text-white"
                icon="solar:check-circle-bold"
                width={48}
              />
            </div>
          </motion.div>

          <motion.div className="text-center space-y-2" variants={itemVariants}>
            <h2 className="text-[26px] sm:text-[32px] font-bold text-slate-900">
              اطلاعات با موفقیت ثبت شد
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-md">
              راننده‌ی{" "}
              <span className="font-bold text-slate-900">مسترشوفر</span> در مبدا
              مورد نظر شما، در زمان مقرر، حضور خواهد یافت.
            </p>
          </motion.div>

          {/* Info Cards */}
          <motion.div
            className="grid grid-cols-2 gap-3 w-full max-w-md mt-4"
            variants={itemVariants}
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-center">
              <div className="flex justify-center">
                <Icon
                  className="text-primary-500 mx-auto mb-2"
                  icon="solar:phone-calling-bold-duotone"
                  width={24}
                />

                <Icon
                  className="text-yellow-600 mx-auto mb-2"
                  icon="solar:user-circle-line-duotone"
                  width={24}
                />
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                تماس راننده با شما
              </p>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {callTimeText}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-center">
              <Icon
                className="text-success-500 mx-auto mb-2"
                icon="solar:document-text-bold-duotone"
                width={24}
              />
              <p className="text-[11px] text-slate-500 font-medium">وضعیت</p>
              <p className="text-sm font-bold text-slate-900 mt-1">ثبت شده</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Support Call to Action Card */}
        <motion.div
          className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-3 shadow-sm"
          variants={itemVariants}
        >
          <div className="flex items-start gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <Icon
                className="text-blue-600"
                icon="solar:phone-bold-duotone"
                width={18}
              />
            </div>
            <div className="flex-1">
              <p className="text-[11px] sm:text-[12px] text-slate-600 leading-snug mb-2">
                در صورت وجود توضیحات درباره سفر، مانند{" "}
                <span className="font-bold text-slate-800">اضافه بار</span>،{" "}
                <span className="font-bold text-slate-800">اضافه مسیر</span>،
                وجود مقصد یا مبدا در{" "}
                <span className="font-bold text-slate-800">طرح ترافیک</span>، با
                پشتیبانی مسترشوفر تماس حاصل فرمایید
              </p>
              <a
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-md"
                href="tel:+982128422243"
              >
                <Icon icon="solar:phone-calling-bold" width={14} />
                <span>۰۲۱-۲۸۴۲۲۲۴۳</span>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
