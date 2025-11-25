"use client";

import React from "react";
import { motion } from "framer-motion";

export default function ProgressDots({ currentStep, totalSteps }) {
  return (
    <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse py-1.5">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <motion.div
          key={step}
          animate={{ scale: 1 }}
          className={`
            w-2 h-2 rounded-full transition-all duration-300
            ${
              currentStep === step
                ? "bg-default-500"
                : currentStep > step
                  ? "bg-default-500"
                  : "bg-gray-300"
            }
          `}
          initial={{ scale: 0 }}
          transition={{ delay: step * 0.1, duration: 0.3 }}
        />
      ))}
    </div>
  );
}
