"use client";

import React from "react";
import { motion } from "framer-motion";
import { Spinner } from "@heroui/react";

export default function TripLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden flex items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />

      {/* MrShoofer Logo */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-between items-center p-6">
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

      {/* Loading Content */}
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.4 }}
      >
        <Spinner
          classNames={{
            circle1: "border-b-primary",
            circle2: "border-b-primary",
          }}
          color="warning"
          size="lg"
        />
        <motion.p
          animate={{ opacity: 1, y: 0 }}
          className="text-gray-600 text-base"
          initial={{ opacity: 0, y: 10 }}
          transition={{ delay: 0.2 }}
        >
          در حال بارگذاری اطلاعات سفر...
        </motion.p>
      </motion.div>
    </div>
  );
}
