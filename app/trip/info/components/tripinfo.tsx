"use client";

import React from "react";
import { Prisma, Trip, TripStatus } from "@prisma/client";

const PersianDate = require("persian-date");

import { format } from "date-fns";

import { Snippet } from "@heroui/snippet";

import { Card } from "@heroui/card";

import { Image } from "@heroui/react";

import { Divider } from "@heroui/divider";

import { Chip } from "@heroui/chip";

import { Badge } from "@heroui/badge";

import Steps from "./steps";

type TripInfoProps = {
  trip: Prisma.TripGetPayload<{ include: { Location: true; Passenger: true } }>;
};

function TripInfo({ trip }: TripInfoProps) {
  const [currentStep, setCurrentStep] = React.useState(-1);
  const persianStartDate = new PersianDate(trip.StartsAt);

  React.useEffect(() => {
    switch (trip.status) {
      case TripStatus.wating_info:
        setCurrentStep(2);
        break;
      case TripStatus.wating_start:
        setCurrentStep(3);
        break;
      default:
        setCurrentStep(3);
        break;
    }
  }, [trip.status]);

  let status_content;
  let status_color:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | undefined;
  switch (trip.status) {
    case TripStatus.wating_info:
      status_content = "هنوز موقعیت مبدا را از شما دریافت نکردیم";
      status_color = "warning";
      break;
    case TripStatus.wating_start:
      status_content = "همه چیز آمادست!";
      status_color = "primary";
      break;
    case TripStatus.canceled:
      status_content = "سفر شما لغو شده است";
      status_color = "danger";
      break;
    case TripStatus.intrip:
      status_content = "سفر خوبی داشته باشید";
      status_color = "success";
      break;
    default:
      status_content = "سفر خوبی داشته باشید";
      status_color = "success";
      break;
  }

  return (
    <div>
      <div className="flex justify-between align-center">
        <h1 className="text-2xl font-semibold">اطلاعات سفر</h1>

        <Chip variant="bordered" color="default">
          <span className="font-light text-sm self-center">
            رفرنس
            <span className="ps-1">{trip.TicketCode}</span>
          </span>
        </Chip>
      </div>
      <p className="font-light text-sm mt-1 ms-2">جزییات سفر شما</p>

      <Chip className="mt-2" color={status_color} variant="flat">
        <h1 className="font-lg text-center" id="getting-started">
          {status_content}
        </h1>
      </Chip>

      <Card className="mt-4 flex flex-col justify-between pt-2 pb-3 px-0 rounded-3xl">
        <div className="flex flex-col mt-3">
          <div className="flex justify-between px-7">
            <label className="font-light text-sm">📍مبدا</label>

            <label className="font-light text-sm">📍مقصد</label>
          </div>

          <div className="flex justify-around py-1 px-8 font-bold align-center ">
            <label className="font-semibold text-lg">{trip.OriginCity}</label>

            <span className="text-gray-400 text-lg">
              ......
              <span className="text-2xl">🚕</span>
              ......
            </span>

            <label className="font-semibold text-lg">
              {trip.DestinationCity}
            </label>
          </div>
        </div>

        <Divider className="my-0" />

        <div className="flex flex-col mt-3">
          <span className="text-sm ms-4 font-light">شروع سفر</span>

          <div className="flex justify-between">
            <div className="mt-0 flex flex-col justify-between py-2 px-0 rounded-2xl">
              <div className="flex justify-between px-5 py-0 align-baseline gap-x-2">
                <div className="flex justify-between gap-2">
                  <div className="self-center bg-gray-100 p-1  rounded-2xl">
                    <Image
                      src="/icons8-calendar-48.png" // Make sure the file is in public/icons8-calendar.png
                      alt="Calendar"
                      width={40}
                      height={40}
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex flex-col align-middle flex-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium block ">
                        <span className="ms-1">
                          {persianStartDate.format("DD")}
                        </span>
                        <span className="ms-1">
                          {persianStartDate.format("MMMM")}
                        </span>

                        <span className="ms-1  font-light text-sm">
                          {persianStartDate.format("YYYY")}
                        </span>
                      </span>
                    </div>

                    <label className="font-light text-sm text-start align-middle ">
                      {persianStartDate.format("dddd")}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-0 flex flex-col justify-between py-2 px-0 rounded-2xl">
              <div className="flex justify-between pe-7 py-0 align-baseline gap-x-2">
                <div className="">
                  <div className="flex flex-col align-middle flex-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold block ">
                        <span className="ms-1 font-md">🕜 ساعت</span>
                      </span>
                    </div>

                    <label className="font-left text-sm text-start align-middle ">
                      <span className="ms-1 font-light text-xs">
                        {format(trip.StartsAt, "HH:mm")}
                      </span>
                      <span className="ms-1 font-light text-xs">
                        {(() => {
                          const hour = new Date(trip.StartsAt).getHours();
                          if (hour >= 5 && hour < 12) return "صبح";
                          if (hour >= 12 && hour < 16) return "ظهر";
                          if (hour >= 16 && hour < 20) return "بعدازظهر";
                          return "شب";
                        })()}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Divider className="mb-2" />

          <div className="flex justify-between px-6">
            <Chip color="warning" variant="shadow">
              {trip.ServiceName}
            </Chip>

            <Chip color="warning" className="text-gray-700" variant="bordered">
              <span className="pe-1 text-lg">🚖</span>

              {trip.CarName}
            </Chip>
          </div>
        </div>
      </Card>

      {trip.status == TripStatus.canceled && (
        <div className="mt-4">
          <h1
            className="mb-2 font-md font-light text-center py-2 bg-default-100 border-solid border rounded-2xl"
            id="getting-started"
          >
            سفر سواری شما لغو شده است
          </h1>
          <p className="mb-1 text-small text-center font-light text-default-500">
            در صورت نیاز می‌توانید با تیم مسترشوفر در تماس باشید
          </p>
          <p className="mb-5 text-xs text-center font-light text-default-500">
            به امید دیدار مجدد
          </p>
        </div>
      )}

      <div className="flex justify-center">
        <Steps
          trip={trip}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        ></Steps>
      </div>
    </div>
  );
}

export default TripInfo;
