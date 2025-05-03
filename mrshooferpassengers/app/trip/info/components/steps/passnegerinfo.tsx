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
    description: "ورود و ثبت اطلاعات سرپرست مسافرین",
    details: [
      "اطلاعات سرپرست مسافرین با موفقیت از شما دریافت شده است",
      "هماهنگی‌های لازم از طرف مسترشوفر، با شماره وارد شده انجام خواهد گرفت",
    ],
  };

  const status: "active" | "inactive" | "complete" = "complete";

  return (
    <li
      className={cn(
        "group relative gap-4 rounded-large border border-default-200 data-[status=active]:bg-default-100 dark:border-default-50 dark:data-[status=active]:bg-default-50",
        stepClassName
      )}
      data-status={status}
    >
      <div className="flex w-full max-w-full items-center">
        <button
          ref={ref}
          aria-current={undefined}
          className={cn(
            "flex w-full cursor-pointer items-center justify-center gap-x-4 rounded-large px-3 py-2.5"
          )}
          onClick={() => setCurrentStep(1)}
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
                  " relative flex h-[34px] w-[34px] items-center justify-center rounded-full border-medium text-large font-semibold bg-green-500",
                  {
                    "shadow-lg": status === "complete",
                  }
                )}
              >
                <div className="fle x items-center justify-center">
                  <svg
                    className="h-6 w-6 text-[var(--active-fg-color)]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      pathLength={1}
                      strokeDashoffset="0px"
                      strokeDasharray="1px 1px"
                    />
                  </svg>
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
            animate={currentStep == 1 ? "open" : "closed"}
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
