import React from "react";
import { LazyMotion, m, domAnimation } from "framer-motion";
import { Spacer } from "@heroui/react";
import { cn } from "@heroui/react";
import type { ComponentProps } from "react";

import { Prisma, TripStatus } from "@prisma/client";

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
  trip: Prisma.TripGetPayload<{ include: { Location: true } }>;
  stepClassName?: string;
  ref?: React.Ref<HTMLButtonElement>;
  [key: string]: any;
}) {
  const content = {
    title: (
      <>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-5 inline me-2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
          />
        </svg>
        انجام سفر
      </>
    ),
    description: (
      <>
        {trip.status == TripStatus.wating_info ? (
          <>
            <span className="">سفرشما در زمان مقرر، انجام خواهد گرفت</span>
          </>
        ) : trip.status == TripStatus.wating_start ? (
          <span className="text-blue-400">سفرشما در انتظار شروع است</span>
        ) : trip.status == TripStatus.intrip ? (
          <span className="text-blue-400">
            مسترشوفر در طول مسیر، در کنار شماست
          </span>
        ) : trip.status == TripStatus.done ? (
          <span className="text-green-700">
            از همراهی شما با مسترشوفر سپاسگزاریم
          </span>
        ) : (
          <span className="text-green-700">سفرخوشی داشته باشید</span>
        )}
      </>
    ),
    details: [
      "اطلاعات سرپرست مسافرین با موفقیت از شما دریافت شده است",
      "هماهنگی‌های لازم از طرف مسترشوفر، با شماره وارد شده انجام خواهد گرفت",
    ],
  };

  const status: "active" | "inactive" | "complete" =
    trip.status === TripStatus.intrip || trip.status === TripStatus.wating_start
      ? "active"
      : trip.status === TripStatus.done
        ? "complete"
        : "inactive";

  let openState: "open" | "closed";

  if (currentStep == 3) {
    openState = "open";
  } else {
    openState = "closed";
  }

  return (
    <li
      className={cn(
        "group shadow-md bg-white relative gap-4 rounded-large border border-default-200 data-[status=active]:bg-default-100 dark:border-default-50 dark:data-[status=active]:bg-default-50",
        stepClassName
      )}
      data-status={
        trip.status == TripStatus.done ||
          trip.status == TripStatus.intrip ||
          trip.status == TripStatus.wating_start
          ? "complete"
          : "active"
      }
    >
      <div className="flex w-full max-w-full items-center">
        <button
          ref={ref}
          aria-current={undefined}
          className={cn(
            "flex w-full cursor-pointer items-center justify-center gap-x-4 rounded-large px-3 py-2.5"
          )}
          onClick={() => setCurrentStep(3)}
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
                  "text-tiny text-default-600 transition-[color,opacity] duration-300 group-active:opacity-80 lg:text-small",
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
                  " relative flex h-[34px] w-[34px] items-center justify-center rounded-full border-medium text-large font-semibold ",
                  {
                    "shadow-lg": status === "complete",
                    "bg-green-500": status === "complete",
                  },
                  {
                    "border-yellow-600": status === "active",
                  }
                )}
              >
                <div className="fle x items-center justify-center align-center">
                  {status === "active" ? (
                    <>
                      <span className="self-center text-center">⌛</span>
                    </>
                  ) : (
                    <>
                      <span className="self-center text-center">⌛</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>
      {content.details && content.details?.length > 0 && (
        <LazyMotion features={domAnimation}>
          <m.div
            key={0}
            animate={currentStep == 3 ? "open" : "closed"}
            className="flex"
            exit="complete"
            initial={false}
            transition={{
              opacity: { duration: 0.25 },
              height: { type: "spring", stiffness: 300, damping: 30 },
            }}
            variants={{
              open: { opacity: 1, height: "auto" },
              closed: { opacity: 0, height: 0 },
              // complete: { opacity: 0, height: 0 },
            }}
          >
            <Spacer x={1} />
            <ul className="list-disc pb-4 pe-3 pr-12 text-default-400 text-start mt-2">
              {content.details.map((detail, idx) => (
                <li key={idx} className="mb-1 text-tiny">
                  {detail}
                </li>
              ))}
            </ul>
          </m.div>
        </LazyMotion>
      )}
    </li>
  );
}
