"use client";

import React, { useEffect, useState, useCallback } from "react";
import { LazyMotion, m, domAnimation } from "framer-motion";
import { Button, Card, Spacer } from "@heroui/react";
import { cn } from "@heroui/react";
import type { ComponentProps } from "react";
import { useRouter } from 'next/navigation';
import { Prisma } from "@prisma/client";

const TripStatus = {
  wating_info: "wating_info",
};

export default function StepItem({
  currentStep,
  setCurrentStep,
  trip,
  stepClassName,
  ref,
  ...props
}: {
  currentStep: number;
  setCurrentStep: (stepIdx: number) => void;
  trip: Prisma.TripGetPayload<{ include: { Location: true; Passenger: true } }>;
  stepClassName?: string;
  ref?: React.Ref<HTMLButtonElement>;
  [key: string]: any;
}) {
  const router = useRouter();

  const handleLocationSelection = () => {
    // Navigate to the location selector page
    router.push(`/trip/location/${trip.SecureToken}`);
  };

  const content = {
    title: (
      <>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-5 inline me-2 text-black"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
          />
        </svg>
        اطلاعات مبدا
      </>
    ),
    description: (
      <>
        {trip.Location == null ? (
          <>
            <span className="ms-1 me-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6 text-yellow-400 inline"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            </span>
            <span className="text-red-500">
              هنوز مبدا برای این سفر ثبت نشده است
            </span>
          </>
        ) : (
          <span className="text-gray-800 font-bold inline-block align-bottom">
            <span className="text-black me-1 font-light">آدرس :</span>
            {trip.Location?.TextAddress}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-4 inline ms-1 text-purple-300"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
          </span>
        )}
      </>
    ),
    details: [
      "اطلاعات سرپرست مسافرین با موفقیت از شما دریافت شده است",
      "هماهنگی‌های لازم از طرف مسترشوفر، با شماره وارد شده انجام خواهد گرفت",
    ],
  };

  // Always open, never closed
  const status: "active" | "inactive" | "complete" = "active";

  return (
      <li
        className={cn(
          "group shadow-md bg-white relative gap-4 rounded-large border border-default-200 data-[status=active]:bg-default-100 dark:border-default-50 dark:data-[status=active]:bg-default-50",
          trip.Location ? "opacity-60 pointer-events-none" : "",
          stepClassName
        )}
        data-status={status}
      >
      <div className="flex w-full max-w-full items-center">
        <button
          ref={ref}
          aria-current={undefined}
          className={cn(
            "flex w-full cursor-default items-center justify-center gap-x-4 rounded-large px-3 py-2.5"
          )}
          // Remove click handler so it never closes
          {...props}
        >
          <div className="flex-1 text-right">
            <div>
              <div
                className={cn(
                  "text-medium font-medium text-default-foreground transition-[color,opacity] duration-300 group-active:opacity-80",
                  {}
                )}
              >
                {content.title}
              </div>
              <div
                className={cn(
                  "text-small text-default-600 transition-[color,opacity] duration-300 group-active:opacity-80 lg:text-small",
                  {}
                )}
              >
                {content.description}
              </div>
            </div>
          </div>
          <div className="flex h-full items-center">
            <div className="relative">
              <div
                className={cn(
                  "relative flex h-[34px] w-[34px] items-center justify-center rounded-full border-medium text-large font-semibold border-primary-300 bg-primary-100 text-primary-700 shadow-lg"
                )}
              >
                {trip.Location ? (
                  // Show check icon if location exists
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  // Show number 3 if no location
                  <span className="text-primary-700 font-bold">3</span>
                )}
              </div>
            </div>
          </div>
        </button>
      </div>

      <LazyMotion features={domAnimation}>
        <m.div
          animate={{
            height: "auto",
            opacity: 1,
          }}
          exit={{ height: 0, opacity: 0 }}
          initial={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          style={{ overflow: "hidden" }}
        >
          <Card className="m-4 mt-5 pt-0">
            <Button
              size="lg"
              className=""
              color="primary" variant="solid"

              onClick={handleLocationSelection}
            >
              {trip.Location == null ? "ثبت مبدأ" : "مشاهده لوکیشن و تغییر"}

              {trip.Location == null ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                  />
                </svg>
              )}

            </Button>
          </Card>
        </m.div>
      </LazyMotion>
    </li>
  );
}
