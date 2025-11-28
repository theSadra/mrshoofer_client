"use client";

import React from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Button } from "@heroui/react";

const containerVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
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
      damping: 15,
      delay: 0.2,
    },
  },
};

interface TripNotFoundProps {
  message?: string;
  onRetry?: () => void;
}

export default function TripNotFound({
  message = "سفر یافت نشد",
  onRetry,
}: TripNotFoundProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />

      {/* MrShoofer Logo */}
      <div className="relative z-20 flex justify-between items-center p-6">
        <motion.div
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center"
          initial={{ opacity: 0, x: -30 }}
          transition={{ delay: 0.3 }}
        >
          <img
            alt="MrShoofer"
            className="h-8 sm:h-10 w-auto object-contain"
            src="/mrshoofer_logo_full.png"
          />
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-4 py-8">
        <motion.div
          animate="visible"
          className="text-center max-w-md mx-auto w-full"
          initial="hidden"
          variants={containerVariants}
        >
          {/* Emoji Warning Icon */}
          <div className="mb-6">
            <div className="text-[64px] leading-none">⚠️</div>
          </div>

          {/* Text Content */}
          <motion.div className="space-y-3 mb-8" variants={itemVariants}>
            <h1 className="font-bold text-2xl text-gray-900">{message}</h1>
            <p className="text-sm text-gray-600 leading-relaxed max-w-sm mx-auto">
              متأسفانه اطلاعات سفر شما یافت نشد. لطفاً لینک را بررسی کنید یا با
              پشتیبانی تماس بگیرید
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="flex justify-center items-center mb-10"
            variants={itemVariants}
          >
            <Button
              startContent={<Icon icon="solar:home-smile-linear" width={18} />}
              variant="bordered"
              onClick={() => (window.location.href = "/")}
            >
              بازگشت به خانه
            </Button>
          </motion.div>

          {/* Support Info */}
          <motion.div
            className="grid grid-cols-1 gap-3 max-w-sm mx-auto"
            variants={itemVariants}
          >
            <a
              className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200 hover:border-primary-400 hover:bg-primary-50/50 transition-all cursor-pointer"
              href="tel:+982128422243"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon
                    className="text-primary-600"
                    icon="solar:phone-calling-rounded-outline"
                    width={20}
                  />
                </div>
                <div className="text-right flex-1">
                  <p className="text-xs text-gray-600 font-medium text-center">
                    پشتیبانی تلفنی مِسترشوفر
                  </p>
                  <p className="font-semibold text-sm text-center text-blue-600">
                    ۰۲۱-۲۸۴۲۲۲۴۳
                  </p>
                </div>
                <div className="w-10 h-10 " />
              </div>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
