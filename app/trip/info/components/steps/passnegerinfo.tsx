import React from "react";
import { LazyMotion, m, domAnimation } from "framer-motion";
import { Spacer } from "@heroui/react";
import { cn } from "@heroui/react";
import type { ComponentProps } from "react";

export default function StepItem({
  currentStep,
  setCurrentStep,
  stepClassName,
  ref,
  ...props
}: {
  currentStep: number;
  setCurrentStep: (stepIdx: number) => void;
  stepClassName?: string;
  ref?: React.Ref<HTMLButtonElement>;
  [key: string]: any;
}) {
  function CheckIcon(props: ComponentProps<"svg">) {
    return (
      <svg
        {...props}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <m.path
          animate={{ pathLength: 1 }}
          d="M5 13l4 4L19 7"
          initial={{ pathLength: 0 }}
          strokeLinecap="round"
          strokeLinejoin="round"
          transition={{
            delay: 0.2,
            type: "tween",
            ease: "easeOut",
            duration: 0.3,
          }}
        />
      </svg>
    );
  }

  const content = {
    title: (
      <>
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="inline size-5 me-2 text-pink-700"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
          اطلاعات مسافر
        </>
      </>
    ),
    description: "اطلاعات سرپرست مسافرین دریافت شده است",
    details: [
      "اطلاعات سرپرست مسافرین با موفقیت از شما دریافت شده است",
      "هماهنگی‌های لازم از طرف مسترشوفر، با شماره وارد شده انجام خواهد گرفت",
    ],
  };

  // Always closed, never open
  const status: "active" | "inactive" | "complete" = "complete";

  return (
    <li
      className={cn(
        "group shadow-md bg-white relative gap-4 rounded-large border border-default-200 data-[status=active]:bg-default-100 dark:border-default-50 dark:data-[status=active]:bg-default-50",
        stepClassName
      )}
      data-status={status}
    >
      <div className="flex w-full max-w-full items-center">
        <button
          ref={ref}
          aria-current={undefined}
          className={cn(
            "flex w-full cursor-not-allowed items-center justify-center gap-x-4 rounded-large px-3 py-2.5 opacity-60"
          )}
          // Remove click handler so it never opens
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
                  "text-sm text-default-700 transition-[color,opacity] duration-300 group-active:opacity-80 lg:text-small",
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
              </div>
            </div>
          </div>
        </button>
      </div>
      {/* Details always closed */}
    </li>
  );
}
