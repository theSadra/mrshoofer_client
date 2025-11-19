"use client";

import React from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

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
  return (
    <motion.div
      animate="visible"
      className="text-center flex flex-col justify-between h-full min-h-[55vh] px-3 sm:px-6 py-6 sm:py-8 gap-6"
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
              className="w-36 h-36 sm:w-40 sm:h-40 bg-gradient-to-br from-primary-200 to-primary-400 rounded-full flex items-center justify-center shadow-xl"
              transition={{ type: "spring", stiffness: 300 }}
              whileHover={{ scale: 1.05 }}
            >
              <Icon
                className="w-14 h-14 sm:w-16 sm:h-16 text-white"
                height={56}
                icon="solar:taxi-bold-duotone"
                width={64}
              />
            </motion.div>

            {/* Floating elements */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [0, 10, -10, 0],
              }}
              className="absolute -top-3 -right-3 w-6 h-6 sm:w-8 sm:h-8 bg-warning-400 rounded-full flex items-center justify-center"
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
          </div>
        </motion.div>

        {/* Text Content Section */}
        <div className="space-y-4">
          {/* Title */}
          <motion.h1
            className="font-extrabold text-2xl sm:text-3xl mt-4 pt-1 text-center"
            variants={itemVariants}
          >
            به مسترشوفر خوش آمدیـد
          </motion.h1>

          {/* Subtitle */}

          <motion.p
            className="typography-subtitle text-center max-w-lg px-2 text-sm sm:text-base leading-relaxed"
            variants={itemVariants}
          >
            از خرید شما متشکریم! برای سفر تهران به اصفهان کافیست چند قدم ساده را
            دنبال کنید
          </motion.p>
        </div>
      </div>

      {/* Features Section - Bottom Section */}
      <motion.div
        className="grid grid-cols-3 gap-4 sm:gap-6 max-w-sm mx-auto w-full mt-4 sm:mt-8"
        variants={itemVariants}
      >
        <div className="text-center">
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2.5">
            <Icon
              className="text-primary-600"
              icon="solar:shield-check-bold-duotone"
              width={24}
            />
          </div>
          <p className="typography-feature-text text-default-700 text-xs sm:text-sm">
            تایید شده و امن
          </p>
        </div>

        <div className="text-center">
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-2.5">
            <Icon
              className="text-success-600"
              icon="solar:ticket-bold-duotone"
              width={24}
            />
          </div>
          <p className="typography-feature-text text-default-700 text-xs sm:text-sm">
            سریع
          </p>
        </div>

        <div className="text-center">
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-2.5">
            <Icon
              className="text-warning-600"
              icon="solar:dollar-minimalistic-bold-duotone"
              width={24}
            />
          </div>
          <p className="typography-feature-text text-default-700 text-xs sm:text-sm">
            مقرون به صرفه
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
