"use client";

import React from "react";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Divider } from "@heroui/react";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Icon } from "@iconify/react";

export type TripStatus = "pending" | "ongoing" | "completed";

export type Trip = {
  id: string;
  pickup: string;
  dropoff: string;
  scheduledAt?: string; // localized string (deprecated in UI)
  scheduledTime?: string; // fa-IR time like "۱۴:۳۰"
  scheduledDate?: string; // fa-IR date like "۱۵ شهریور ۱۴۰۴"
  status: TripStatus;
  assignedDriverId?: string | null;
  driverName?: string;
  driverCar?: string;
  driverPhone?: string;
  tripCarName?: string;
  ticketCode?: string;
  hasLocation?: boolean;
  originLat?: number;
  originLng?: number;
  originAddress?: string;
  originDescription?: string;
  startsAtMs?: number;
};

export type TripCardProps = {
  trip: Trip;
  onOpenAssignAction: () => void;
  onOpenLocationAction?: (lat?: number, lng?: number, addressText?: string) => void;
  onOpenCallAction?: (driverName?: string, driverPhone?: string) => void;
  onOpenLocationDescAction?: (description?: string) => void;
  onOpenPovLinkAction?: (token?: string) => void;
};

const assignChip = (assigned: boolean) => (
  <Chip
    className="font-medium"
    color={assigned ? "success" : "danger"}
    size="sm"
    variant="flat"
  >
    <span className="inline-flex items-center gap-1 p-1">
      <Icon
        icon={
          assigned
            ? "heroicons-outline:check-circle"
            : "heroicons-outline:x-circle"
        }
        width={16}
      />
      {assigned ? "راننده دارد" : "بدون راننده"}
    </span>
  </Chip>
);

export default function TripCard({
  trip,
  onOpenAssignAction,
  onOpenLocationAction,
  onOpenCallAction,
  onOpenLocationDescAction,
  onOpenPovLinkAction,
}: TripCardProps) {
  const assigned = !!trip.assignedDriverId;
  const URGENT_MIN = 30;
  const toFaDigits = (s: string) =>
    s.replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

  const CountdownChip: React.FC = () => {
    const [now, setNow] = React.useState<number>(Date.now());

    React.useEffect(() => {
      const id = setInterval(() => setNow(Date.now()), 1000);

      return () => clearInterval(id);
    }, []);
    if (!trip.startsAtMs || !isFinite(trip.startsAtMs)) return null;
    const diff = trip.startsAtMs - now;
    const past = diff <= 0;
    const totalSec = Math.max(0, Math.floor(diff / 1000));
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    const toFaDigits = (s: string) =>
      s.replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
    const hh = toFaDigits(hours.toString());
    const mm = toFaDigits(minutes.toString().padStart(2, "0"));
    const ss = toFaDigits(seconds.toString().padStart(2, "0"));
    const urgent = !assigned && totalSec <= URGENT_MIN * 60;

    return (
      <Chip
        className={`${!urgent ? "bg-default-100" : ""} p-1`}
        color={urgent ? "danger" : "default"}
        size="sm"
        title={past ? "شروع شده" : "تا شروع"}
        variant={urgent ? "solid" : "flat"}
      >
        <span className="inline-flex items-center gap-1">
          {past ? (
            <span className={!assigned ? "font-bold" : ""}>شروع شده</span>
          ) : (
            <span className={!assigned ? "font-md text-ms" : "text-xs"}>
              باقی‌مانده: {hh}:{mm}:{ss}
            </span>
          )}
          <Icon
            icon={
              past
                ? "heroicons-outline:play"
                : urgent
                  ? "heroicons-outline:exclamation-triangle"
                  : "gg:sand-clock"
            }
            width={14}
          />
        </span>
      </Chip>
    );
  };

  return (
    <Card
      className="rounded-xl border border-default-200"
      dir="rtl"
      shadow="sm"
    >
      <CardHeader className="flex items-center justify-between gap-3 py-3 px-4">
        <div className="flex items-center gap-2 text-default-600 text-sm">
          <Icon icon="solar:clock-circle-linear" width={18} />
          {trip.scheduledTime ? (
            <span className="inline-flex items-baseline gap-1">
              <span className="font-bold text-default-900">
                {trip.scheduledTime}
              </span>
              {trip.scheduledDate ? (
                <span className="text-default-500 text-xs sm:text-sm">
                  {trip.scheduledDate}
                </span>
              ) : null}
            </span>
          ) : (
            <span className="font-bold">فوری</span>
          )}
          {/* Location status + description chips */}
          <button
            className="inline-flex items-center"
            disabled={
              !onOpenLocationAction ||
              typeof trip.originLat !== "number" ||
              typeof trip.originLng !== "number"
            }
            title={
              trip.hasLocation ? "نمایش مبدا روی نقشه" : "لوکیشن تعیین نشده"
            }
            type="button"
            onClick={() => {
              if (
                onOpenLocationAction &&
                typeof trip.originLat === "number" &&
                typeof trip.originLng === "number"
              ) {
                onOpenLocationAction(
                  trip.originLat,
                  trip.originLng,
                  trip.originAddress || trip.pickup,
                );
              }
            }}
          >
            <Chip
              className="bg-default-100 p-1 gap-1"
              color="default"
              size="sm"
              variant="flat"
            >
              <Icon
                className={
                  trip.hasLocation
                    ? "text-success inline"
                    : "text-danger inline"
                }
                icon={
                  trip.hasLocation
                    ? "qlementine-icons:location-16"
                    : "material-symbols-light:location-off-outline-rounded"
                }
                width={16}
              />
              {trip.hasLocation && "مبدا"}
            </Chip>
          </button>
          {trip.originDescription ? (
            <button
              className="inline-flex items-center"
              disabled={!onOpenLocationDescAction}
              title="نمایش توضیح مبدا"
              type="button"
              onClick={() =>
                onOpenLocationDescAction && onOpenLocationDescAction(trip.originDescription)
              }
            >
              <Chip
                className="bg-default-100 p-1 gap-1"
                color="default"
                size="sm"
                variant="flat"
              >
                <Icon className="text-default-500" icon="mdi:text" width={16} />
                توضیح
              </Chip>
            </button>
          ) : null}
          { (trip as any).secureToken ? (
            <button
              className="inline-flex items-center justify-center rounded-full p-1 hover:bg-default-200 transition"
              title="لینک مسافر"
              type="button"
              onClick={() => onOpenPovLinkAction && onOpenPovLinkAction((trip as any).secureToken)}
            >
              <Icon className="text-default-500" icon="solar:link-circle-linear" width={18} />
            </button>
          ) : null }
        </div>
        {assignChip(assigned)}
      </CardHeader>
      <CardBody className="py-3 px-4">
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center justify-start gap-2">
              <Icon
                className="text-primary"
                icon="solar:map-point-bold"
                width={18}
              />
              <span className="font-medium truncate" title={trip.pickup}>
                {trip.pickup}
              </span>
              <Icon
                className="text-default-500 "
                icon="solar:arrow-left-linear"
                width={16}
              />
              <span className="font-medium truncate" title={trip.dropoff}>
                {trip.dropoff}
              </span>
            </div>
            {trip.tripCarName ? (
              <div className="mt-1 inline-flex items-center gap-1 text-xs text-default-500">
                <Icon
                  className="text-default-400"
                  icon="noto:taxi"
                  width={17}
                />

                <span className="whitespace-nowrap">خودرو سفر:</span>
                <span className="font-medium text-default-700">
                  {trip.tripCarName}
                </span>
              </div>
            ) : null}
            {trip.ticketCode ? (
              <div className="mt-1 inline-flex items-center gap-1 text-xs text-default-500">
                <Icon
                  className="text-default-400"
                  icon="solar:ticket-linear"
                  width={16}
                />
                <span className="whitespace-nowrap">شماره سفر:</span>
                <span className="font-medium text-default-700">
                  {toFaDigits(trip.ticketCode)}
                </span>
              </div>
            ) : null}
          </div>
          {/* Countdown moved here to separate from start time and avoid confusion (only show if unassigned) */}
          {!assigned ? (
            <div className="flex items-center justify-end">
              <CountdownChip />
            </div>
          ) : null}
          <Divider className="my-1 mx-0" />
          <div className="flex items-center justify-between gap-2 ">
            {assigned ? (
              <div className="text-default-700 text-sm">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    <Icon
                      className="text-default-500"
                      icon="heroicons-outline:user"
                      width={18}
                    />
                    <span className="font-medium">
                      {trip.driverName ?? "راننده"}
                    </span>
                    {trip.driverCar ? (
                      <>
                        <span className="text-default-400">•</span>
                        <span className="text-default-600">
                          {trip.driverCar}
                        </span>
                      </>
                    ) : null}
                  </span>
                  <Button
                    isIconOnly
                    aria-label="تماس با راننده"
                    className="text-green-700"
                    isDisabled={!onOpenCallAction}
                    size="sm"
                    variant="light"
                    onPress={() =>
                      onOpenCallAction &&
                      onOpenCallAction(trip.driverName, trip.driverPhone)
                    }
                  >
                    <Icon icon="ion:call" width={18} />
                  </Button>
                </span>
              </div>
            ) : (
              <div className="text-default-900 font-medium text-sm text-start">
                برای این سفر راننده‌ای انتخاب نشده است.
              </div>
            )}
            <Button
              className={!assigned ? "px-8" : ""}
              color="primary"
              size="sm"
              startContent={
                <Icon className="" icon="fa7-regular:edit" width={16} />
              }
              variant={assigned ? "flat" : "solid"}
              onPress={onOpenAssignAction}
            >
              {assigned ? "تغییر راننده" : "انتخاب راننده"}
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
