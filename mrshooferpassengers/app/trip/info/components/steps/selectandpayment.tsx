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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-5 text-blue-800 inline me-1"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z"
          />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-5 me-2 inline text-green-800"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
          />
        </svg>
        انتخاب سفر و پرداخت
      </>
    ),
    description:
      "سفر فوق، به صورت اختصاصی با موفقیت برای شما رزور و خریداری شده است",
    details: [
      "سفر به تاریخ و ساعت فوق، برای شما رزرو قطعی و خریداری شده است",
      "پرداخت سفر با موفقیت انجام گرفته است",
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
          onClick={() => setCurrentStep(0)}
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
                <div className="flex items-center justify-center">
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
            animate={currentStep == 0 ? "open" : "closed"}
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
