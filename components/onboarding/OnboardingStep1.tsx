"use client";

import React from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import Image from "next/image";

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

const iconVariants = {
  hidden: {
    scale: 0,
    rotate: -180,
  },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
      delay: 0.3,
    },
  },
};

export default function OnboardingStep1() {
  const [mounted, setMounted] = React.useState(false);
  const { tripData } = useTripContext();
  const originCity = tripData?.OriginCity?.trim() || "شهر مبدا";
  const destinationCity = tripData?.DestinationCity?.trim() || "شهر مقصد";

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <motion.div
      animate={mounted ? "visible" : "hidden"}
      className="text-center flex flex-col justify-between h-full min-h-[65vh] px-2 sm:px-5 py-6 sm:py-8 gap-6"
      initial="hidden"
      variants={contentVariants}
    >
      <div />
      {/* Main Content Container - Top Section */}
      <div className="flex flex-col items-center w-full max-w-lg mx-auto gap-4">
        {/* Illustration Section */}
        <motion.div className="mb-6" variants={iconVariants}>
          <div className="relative">
            <motion.div
              className="w-36 h-36 sm:w-40 sm:h-40 bg-gradient-to-br from-primary-200 to-primary-400 rounded-full flex items-center justify-center shadow-xl overflow-hidden"
              transition={{ type: "spring", stiffness: 300 }}
              whileHover={{ scale: 1.05 }}
            >
              <Image
                alt="Taxi Check"
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                height={160}
                src="/taxicheck.png"
                width={160}
              />
            </motion.div>

            {/* Floating elements */}
            {mounted && (
              <>
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, 10, -10, 0],
                  }}
                  className="absolute -top-3 -right-3 w-6 h-6 sm:w-8 sm:h-8 bg-warning-400 rounded-full flex items-center justify-center"
                  initial={{ y: 0, rotate: 0 }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Icon
                    className="sm:w-4 sm:h-4 text-white"
                    icon="solar:star-bold"
                    width={12}
                  />
                </motion.div>

                <motion.div
                  animate={{
                    y: [0, 10, 0],
                    rotate: [0, -10, 10, 0],
                  }}
                  className="absolute -bottom-3 -left-3 w-5 h-5 sm:w-6 sm:h-6 bg-success-400 rounded-full flex items-center justify-center"
                  initial={{ y: 0, rotate: 0 }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                >
                  <Icon
                    className="sm:w-3 sm:h-3 text-white"
                    icon="solar:check-circle-bold"
                    width={10}
                  />
                </motion.div>
              </>
            )}
          </div>
        </motion.div>

        {/* Text Content Section */}
        <div className="space-y-4">
          {/* Title */}
          <motion.h1
            className="font-bold text-[28px] sm:text-[34px] mt-4 pt-1 text-center text-gray-800"
            variants={itemVariants}
          >
            به مِسترشوفر خوش آمدیـد
          </motion.h1>

          {/* Subtitle */}

          <motion.p
            className="typography-subtitle text-center max-w-lg px-1 text-sm sm:text-base leading-relaxed text-gray-800"
            variants={itemVariants}
          >
            سفر {originCity} تا {destinationCity} آماده است. فقط چند ثانیه برای تایید
            اطلاعات صرف کنید و ادامه دهید.
          </motion.p>
        </div>
      </div>

      {/* Features Section - Bottom Section */}
      <motion.div
        className="grid grid-cols-3 gap-4 sm:gap-6 max-w-sm mx-auto w-full mt-2"
        variants={itemVariants}
      >
        <div className="text-center">
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2.5">
            <Icon
              className="text-primary-500"
              icon="solar:shield-check-bold-duotone"
              width={24}
            />
          </div>
          <p className="text-gray-800 text-xs sm:text-sm font-medium">
            تایید شده و امن
          </p>
        </div>

        <div className="text-center">
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-2.5">
            <Icon
              className="text-success-500"
              icon="solar:ticket-bold-duotone"
              width={24}
            />
          </div>
          <p className="text-gray-800 text-xs sm:text-sm font-medium">
            سریع
          </p>
        </div>

        <div className="text-center">
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-2.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="text-warning-700"
              width="24"
              height="24"
              viewBox="0 -4 24 28"
            >
              <g>
                <g stroke="currentColor">
                  <path d="M12 -2.8v4.2" />
                  <path d="M5.8 -1.8l3.1 3.1" />
                  <path d="M18.2 -1.8l-3.1 3.1" />
                </g>

                <path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z" />

                <path
                  fill="currentColor"
                  d="M15.764 4a3 3 0 0 1 2.683 1.658l1.386 2.771q.366-.15.72-.324a1 1 0 0 1 .894 1.79a32 32 0 0 1-.725.312l.961 1.923A3 3 0 0 1 22 13.473V16a3 3 0 0 1-1 2.236V19.5a1.5 1.5 0 0 1-3 0V19H6v.5a1.5 1.5 0 0 1-3 0v-1.264c-.614-.55-1-1.348-1-2.236v-2.528a3 3 0 0 1 .317-1.341l.953-1.908q-.362-.152-.715-.327a1.01 1.01 0 0 1-.45-1.343a1 1 0 0 1 1.342-.448q.355.175.72.324l1.386-2.77A3 3 0 0 1 8.236 4zM7.5 13a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3m9 0a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3m-.736-7H8.236a1 1 0 0 0-.832.445l-.062.108l-1.27 2.538C7.62 9.555 9.706 10 12 10c2.142 0 4.101-.388 5.61-.817l.317-.092l-1.269-2.538a1 1 0 0 0-.77-.545L15.765 6Z"
                />
              </g>
            </svg>
          </div>
          <p className="text-gray-800 text-xs sm:text-sm font-medium">
            تاکسی رسمی
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
