"use client";

import React from "react";
import { Card, CardHeader, Divider, Progress, Spacer } from "@heroui/react";
import { Trip } from "@prisma/client";
import VerticalCollapsibleSteps from "./vertical-collapsible-steps";
import { Prisma } from "@prisma/client";

import TripInfoText from "./tripinfotext";

type StepsProps = {
  trip: Prisma.TripGetPayload<{ include: { Location: true; Passenger: true } }>;
  currentStep?: number;
  setCurrentStep?: (step: number) => void;
};

export default function Component({
  trip,
  currentStep,
  setCurrentStep,
}: StepsProps) {
  // const steps = [
  //   // {
  //   //   title:
  //   //     (
  //   //       <>
  //   //         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 text-blue-800 inline me-1">
  //   //           <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
  //   //         </svg>
  //   //         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5 me-2 inline text-green-800">
  //   //           <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
  //   //         </svg>
  //   //         انتخاب سفر و پرداخت
  //   //       </>
  //   //     ),
  //   //   description:
  //   //     "سفر فوق، به صورت اختصاصی با موفقیت برای شما رزور و خریداری شده است",
  //   //   details: [
  //   //     "سفر به تاریخ و ساعت فوق، برای شما رزرو قطعی و خریداری شده است",
  //   //     "پرداخت سفر با موفقیت انجام گرفته است",
  //   //   ],
  //   // },
  //   // {
  //   //   title: (
  //   //     <>
  //   //       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="inline size-5 me-2 text-pink-700">
  //   //         <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  //   //       </svg>
  //   //       اطلاعات مسافر
  //   //     </>
  //   //   ),
  //   //   description: "ورود و ثبت اطلاعات سرپرست مسافرین",
  //   //   details: [
  //   //     "اطلاعات سرپرست مسافرین با موفقیت از شما دریافت شده است",
  //   //     "هماهنگی‌های لازم از طرف مسترشوفر، با شماره وارد شده انجام خواهد گرفت"
  //   //   ],
  //   // },
  //   // {
  //   //   title: (
  //   //     <>
  //   //       <svg
  //   //         xmlns="http://www.w3.org/2000/svg"
  //   //         fill="none"
  //   //         viewBox="0 0 24 24"
  //   //         strokeWidth={1.5}
  //   //         stroke="currentColor"
  //   //         className="size-5 inline me-2 text-black"
  //   //       >
  //   //         <path
  //   //           strokeLinecap="round"
  //   //           strokeLinejoin="round"
  //   //           d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
  //   //         />
  //   //         <path
  //   //           strokeLinecap="round"
  //   //           strokeLinejoin="round"
  //   //           d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
  //   //         />
  //   //       </svg>
  //   //       اطلاعات مبدا
  //   //     </>
  //   //   ),
  //   //   description: (
  //   //     <>
  //   //       {trip.Location == null ? (
  //   //         <>
  //   //           <span className="ms-1 me-1">
  //   //             <svg
  //   //               xmlns="http://www.w3.org/2000/svg"
  //   //               fill="none"
  //   //               viewBox="0 0 24 24"
  //   //               strokeWidth={1.5}
  //   //               stroke="currentColor"
  //   //               className="size-6 text-yellow-400 inline"
  //   //             >
  //   //               <path
  //   //                 strokeLinecap="round"
  //   //                 strokeLinejoin="round"
  //   //                 d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
  //   //               />
  //   //             </svg>
  //   //           </span>
  //   //           <span className="text-red-500">
  //   //             هنوز مبدا برای این سفر ثبت نشده است
  //   //           </span>
  //   //         </>
  //   //       ) : (
  //   //         <span className="text-green-700">
  //   //           آدرس ثبت شده: {trip.Location?.Description}
  //   //         </span>
  //   //       )}
  //   //     </>
  //   //   ),
  //   //   details: [
  //   //     "Select the address that you would like to use for your business.",
  //   //     "If you need to update your address, please contact customer support for assistance.",
  //   //   ],
  //   // },
  //   // {
  //   //   title: "Payment",
  //   //   description:
  //   //     "Complete the registration process to finalize your account setup.",
  //   //   details: [
  //   //     "Review your order and confirm that all details are correct.",
  //   //     "Once your payment is processed, your account will be activated.",
  //   //   ],
  //   // },
  // ];

  // You can now use the `trip` prop here
  // Example: console.log(trip);

  return (
    <section className="max-w-sm mt-4 ">
      <TripInfoText trip={trip} />

      <Spacer className="py-2"></Spacer>

      <VerticalCollapsibleSteps
        currentStep={currentStep}
        // steps={steps}
        trip={trip}
        onStepChange={setCurrentStep}
      />
      <Spacer y={4} />
    </section>
  );
}
