"use client";

import React, { useState } from "react";
import { LazyMotion, m, domAnimation } from "framer-motion";
import { Button, Card } from "@heroui/react";
import { cn } from "@heroui/react";
import { useRouter } from "next/navigation";
import { Prisma } from "@prisma/client";

const TripStatus = {
  wating_info: "wating_info",
};

export default function StepItem({
  currentStep,
  setCurrentStepAction,
  trip,
  stepClassName,
  ref,
  ...props
}: {
  currentStep: number;
  setCurrentStepAction: (stepIdx: number) => void;
  trip: Prisma.TripGetPayload<{ include: { Location: true; Passenger: true } }>;
  stepClassName?: string;
  ref?: React.Ref<HTMLButtonElement>;
  [key: string]: any;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLocationSelection = () => {
    setIsLoading(true);
    router.push(`/trip/location/${trip.SecureToken}`);
  };

  const content = {
    title: (
      <>
        <svg
          className="size-5 inline me-2 text-black"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
            strokeLinecap="round"
            strokeLinejoin="round"
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
                className="size-6 text-yellow-400 inline"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-red-500">
              هنوز مبدا برای این سفر ثبت نشده است
            </span>
          </>
        ) : (
          <span className="text-gray-500 font-light inline-block align-bottom">
            <span className="text-black me-1">آدرس ثبت شده:</span>
            {trip.Location?.TextAddress}
            <svg
              className="size-4 inline ms-1 text-purple-300"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                strokeLinecap="round"
                strokeLinejoin="round"
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

  const status: "active" | "inactive" | "complete" =
    trip.status === TripStatus.wating_info ? "active" : "complete";

  return (
    <li
      className={cn(
        "group shadow-md bg-white  relative gap-4 rounded-large border border-default-200 data-[status=active]:bg-default-100 dark:border-default-50 dark:data-[status=active]:bg-default-50",
        stepClassName,
      )}
      data-status={status}
    >
      <div className="flex w-full max-w-full items-center">
        <button
          ref={ref}
          aria-current={undefined}
          className={cn(
            "flex w-full cursor-pointer items-center justify-center gap-x-4 rounded-large px-3 py-2.5",
          )}
          onClick={() => setCurrentStepAction(2)}
          {...props}
        >
          <div className="flex-1 text-right">
            <div>
              <div
                className={cn(
                  "text-medium font-medium text-default-foreground transition-[color,opacity] duration-300 group-active:opacity-80",
                  {},
                )}
              >
                {content.title}
              </div>
              <div
                className={cn(
                  "text-tiny text-default-600 transition-[color,opacity] duration-300 group-active:opacity-80 lg:text-small",
                  {},
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
                  " relative flex h-[34px] w-[34px] items-center justify-center rounded-full border-medium text-large font-semibold ",
                  {
                    "shadow-lg": status === "complete",
                    "bg-green-500": status === "complete",
                  },
                  {
                    "border-primary-300 bg-primary-100 text-primary-700 shadow-lg":
                      status === "active",
                  },
                )}
              >
                {status === "complete" && (
                  <svg
                    className="h-[18px] w-[18px] text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      fillRule="evenodd"
                    />
                  </svg>
                )}
                {status === "active" && (
                  <span className="text-primary-700 ">2</span>
                )}
              </div>
            </div>
          </div>
        </button>
      </div>

      <LazyMotion features={domAnimation}>
        <m.div
          animate={{
            height: currentStep >= 2 ? "auto" : 0,
            opacity: currentStep >= 2 ? 1 : 0,
          }}
          exit={{ height: 0, opacity: 0 }}
          initial={{ height: 0, opacity: 0 }}
          style={{ overflow: "hidden" }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <Card className="m-4 mt-0 pt-2">
            <Button
              className=""
              color="primary"
              disabled={isLoading}
              size="lg"
              variant="solid"
              onClick={handleLocationSelection}
            >
              {isLoading ? (
                <span>
                  درحال بارگذاری
                  <svg
                    className="animate-spinner inline ms-1"
                    height={30}
                    viewBox="0 0 50 50"
                    width={30}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx={25} cy={10} fill="currentColor" r={2} />
                    <circle
                      cx={25}
                      cy={40}
                      fill="currentColor"
                      opacity={0.3}
                      r={2}
                    />
                    <circle
                      cx={32.5}
                      cy={12}
                      fill="currentColor"
                      opacity={0.3}
                      r={2}
                    />
                    <circle
                      cx={17.5}
                      cy={38}
                      fill="currentColor"
                      opacity={0.3}
                      r={2}
                    />
                    <circle
                      cx={17.5}
                      cy={12}
                      fill="currentColor"
                      opacity={0.93}
                      r={2}
                    />
                    <circle
                      cx={32.5}
                      cy={38}
                      fill="currentColor"
                      opacity={0.3}
                      r={2}
                    />
                    <circle
                      cx={10}
                      cy={25}
                      fill="currentColor"
                      opacity={0.65}
                      r={2}
                    />
                    <circle
                      cx={40}
                      cy={25}
                      fill="currentColor"
                      opacity={0.3}
                      r={2}
                    />
                    <circle
                      cx={12}
                      cy={17.5}
                      fill="currentColor"
                      opacity={0.86}
                      r={2}
                    />
                    <circle
                      cx={38}
                      cy={32.5}
                      fill="currentColor"
                      opacity={0.3}
                      r={2}
                    />
                    <circle
                      cx={12}
                      cy={32.5}
                      fill="currentColor"
                      opacity={0.44}
                      r={2}
                    />
                    <circle
                      cx={38}
                      cy={17.5}
                      fill="currentColor"
                      opacity={0.3}
                      r={2}
                    />
                  </svg>
                </span>
              ) : trip.Location == null ? (
                <>
                  <svg
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 4.5v15m7.5-7.5h-15"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  ثبت مبدأ
                </>
              ) : (
                <>
                  <svg
                    className="size-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  مشاهده لوکیشن و تغییر
                </>
              )}
            </Button>
          </Card>
        </m.div>
      </LazyMotion>
    </li>
  );
}
