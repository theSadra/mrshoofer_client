"use client";

import React from "react";
import { LazyMotion, m, domAnimation } from "framer-motion";
import { Button, Card, Spacer } from "@heroui/react";
import { cn } from "@heroui/react";
import type { ComponentProps } from "react";
import dynamic from "next/dynamic";

import { Prisma, TripStatus } from "@prisma/client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";

const LocationSelector = dynamic(() => import("./locationSelector"), {
  ssr: false,
});

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
          <span className="text-green-700">
            آدرس ثبت شده: {trip.Location?.Description}
          </span>
        )}
      </>
    ),
    details: [
      "اطلاعات سرپرست مسافرین با موفقیت از شما دریافت شده است",
      "هماهنگی‌های لازم از طرف مسترشوفر، با شماره وارد شده انجام خواهد گرفت",
    ],
  };

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const status: "active" | "inactive" | "complete" =
    trip.status === TripStatus.wating_info ? "active" : "complete";

  let openState: "open" | "closed";
  if (status === "active") {
    openState = "open";
  } else if (currentStep == 2) {
    openState = "open";
  } else {
    openState = "closed";
  }

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
          onClick={() => setCurrentStep(2)}
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
                <div className="fle x items-center justify-center">
                  {status === "active" ? (
                    <>!</>
                  ) : (
                    <>
                      {" "}
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
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>
      <LazyMotion features={domAnimation}>
        <m.div
          key={0}
          animate={currentStep == 2 ? "open" : "closed"}
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

          <Card className="p-3 mx-3 mb-3 w-full">
            <Button
              color="primary"
              variant="faded"
              className="border-dashed text-gray-600 mx-5 my-1 border-warning"
              onPress={() => {
                onOpen();
              }}
            >
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
              ثبت آدرس و لوکیشن
            </Button>
          </Card>
        </m.div>
      </LazyMotion>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="full">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 mt-0 pb-1 font-normal">
                انتخاب مبدأ
              </ModalHeader>
              <ModalBody className="h-100 px-0 pt-1">
                <LocationSelector isOpen={isOpen} />
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  لغو
                </Button>
                <Button color="primary" onPress={onClose}>
                  Action
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </li>
  );
}
