"use client";

import type { Trip } from "./TripCard";

import React from "react";
import { Chip, Button } from "@heroui/react";
import { Icon } from "@iconify/react";

export type TripTableProps = {
  trips: Trip[];
  groupBreakIndex?: number; // optional index to insert a separator row (e.g., between unassigned and assigned)
  onOpenAssign: (tripId: string) => void;
  onOpenLocation?: (lat?: number, lng?: number, addressText?: string) => void;
  onOpenCall?: (driverName?: string, driverPhone?: string) => void;
  onOpenLocationDesc?: (description?: string) => void;
};

const assignStatusChip = (assigned: boolean) => (
  <Chip color={assigned ? "success" : "danger"} size="sm" variant="flat">
    <span className="inline-flex p-1 items-center gap-1">
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

const locationStatusChip = (
  hasLocation: boolean | undefined,
  onOpenLocation?: () => void,
) => (
  <button
    className="inline-flex items-center"
    disabled={!onOpenLocation}
    title={hasLocation ? "نمایش مبدا روی نقشه" : "لوکیشن تعیین نشده"}
    type="button"
    onClick={onOpenLocation}
  >
    <Chip
      className="bg-default-100 p-1"
      color="default"
      size="sm"
      variant="flat"
    >
      <span className="text-xs font-nano">لوکیشن</span>
      <Icon
        className={
          hasLocation ? "text-success-700 inline" : "text-danger inline"
        }
        icon={
          hasLocation
            ? "qlementine-icons:location-16"
            : "material-symbols-light:location-off-outline-rounded"
        }
        width={16}
      />
    </Chip>
  </button>
);

export default function TripTable({
  trips,
  groupBreakIndex,
  onOpenAssign,
  onOpenLocation,
  onOpenCall,
  onOpenLocationDesc,
}: TripTableProps) {
  const URGENT_MIN = 30;
  const toFaDigits = (s: string) =>
    s.replace(/[0-9]/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);

  const CountdownChip: React.FC<{ startsAtMs?: number; assigned: boolean }> = ({
    startsAtMs,
    assigned,
  }) => {
    const [now, setNow] = React.useState<number>(Date.now());

    React.useEffect(() => {
      const id = setInterval(() => setNow(Date.now()), 1000);

      return () => clearInterval(id);
    }, []);
    if (!startsAtMs || !isFinite(startsAtMs)) return null;
    const diff = Math.max(0, startsAtMs - now);
    const totalSec = Math.floor(diff / 1000);
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
        title={"تا شروع"}
        variant={urgent ? "solid" : "flat"}
      >
        <span className="inline-flex items-center gap-1">
          <Icon
            icon={
              urgent
                ? "heroicons-outline:exclamation-triangle"
                : "gg:sand-clock"
            }
            width={16}
          />
          <span className={!assigned ? "font-bold" : ""}>
            باقی‌مانده: {hh}:{mm}:{ss}
          </span>
        </span>
      </Chip>
    );
  };

  return (
    <div className="w-full" dir="rtl">
      <div className="overflow-x-auto rounded-xl border border-default-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-default-50 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-center font-semibold text-default-700 whitespace-nowrap">
                وضعیت
              </th>
              <th className="px-3 py-2 text-center font-semibold text-default-700 whitespace-nowrap">
                مسیر
              </th>
              <th className="px-3 py-2 text-center font-semibold text-default-700 whitespace-nowrap">
                زمان
              </th>
              <th className="px-3 py-2 text-center font-semibold text-default-700 whitespace-nowrap">
                راننده
              </th>
            </tr>
          </thead>
          <tbody>
            {trips.map((t, idx) => (
              <React.Fragment key={t.id}>
                <tr
                  className={`transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-default-50"} hover:bg-default-100`}
                >
                  <td className="px-3 py-2 text-center align-middle">
                    <div className="flex flex-col items-center gap-1">
                      <div className="inline-flex items-center gap-2">
                        {assignStatusChip(!!t.assignedDriverId)}
                        {locationStatusChip(
                          (t as any).hasLocation,
                          onOpenLocation &&
                            typeof (t as any).originLat === "number" &&
                            typeof (t as any).originLng === "number"
                            ? () =>
                                onOpenLocation(
                                  (t as any).originLat,
                                  (t as any).originLng,
                                  (t as any).originAddress || t.pickup,
                                )
                            : undefined,
                        )}
                        {(t as any).originDescription ? (
                          <button
                            className="inline-flex items-center"
                            disabled={!onOpenLocationDesc}
                            title="نمایش توضیح مبدا"
                            type="button"
                            onClick={() =>
                              onOpenLocationDesc &&
                              onOpenLocationDesc((t as any).originDescription)
                            }
                          >
                            <Chip
                              className="bg-default-100 p-1"
                              color="default"
                              size="sm"
                              variant="flat"
                            >
                              <span className="text-xs">توضیح</span>
                              <Icon
                                className="text-default-500"
                                icon="mdi:text"
                                width={16}
                              />
                            </Chip>
                          </button>
                        ) : null}
                      </div>
                      {!t.assignedDriverId ? (
                        <CountdownChip
                          assigned={!!t.assignedDriverId}
                          startsAtMs={(t as any).startsAtMs}
                        />
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center align-middle">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center justify-center gap-2">
                        <Icon
                          className="text-primary"
                          icon="solar:map-point-bold"
                          width={16}
                        />
                        <span
                          className="truncate font-semibold text-default-600 max-w-[220px]"
                          title={t.pickup}
                        >
                          {t.pickup}
                        </span>
                        <Icon
                          className="text-default-500 "
                          icon="solar:arrow-left-linear"
                          width={16}
                        />
                        <span
                          className="truncate max-w-[220px] font-semibold text-default-600"
                          title={t.dropoff}
                        >
                          {t.dropoff}
                        </span>
                      </div>
                      {t.tripCarName ? (
                        <div className="mt-1 inline-flex items-center gap-1 text-xs text-default-500">
                          <Icon
                            className="text-default-400"
                            icon="noto:taxi"
                            width={17}
                          />
                          <span className="whitespace-nowrap">خودرو سفر:</span>
                          <span className="font-medium text-default-600">
                            {t.tripCarName}
                          </span>
                        </div>
                      ) : null}
                      {(t as any).ticketCode ? (
                        <div className="mt-1 inline-flex items-center gap-1 text-xs text-default-500">
                          <Icon
                            className="text-default-400"
                            icon="solar:ticket-linear"
                            width={16}
                          />
                          <span className="whitespace-nowrap">شماره سفر:</span>
                          <span className="font-medium text-default-600">
                            {toFaDigits((t as any).ticketCode)}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center align-middle">
                    <div className="flex flex-col items-center leading-tight">
                      <span className="font-bold text-default-900">
                        {t.scheduledTime}
                      </span>
                      <span className="text-xs text-default-500 mt-0.5">
                        {t.scheduledDate}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center align-middle">
                    {t.assignedDriverId ? (
                      <div className="inline-flex items-center gap-4">
                        <div className="inline-flex items-center gap-1">
                          <Icon
                            className="text-default-500"
                            icon="fluent:person-circle-20-regular"
                            width={22}
                          />
                          <span className="font-medium">
                            {(t as any).driverName ?? "راننده"}
                          </span>
                          {(t as any).driverCar ? (
                            <span className="text-default-400">•</span>
                          ) : null}
                          <span className="text-default-600">
                            {(t as any).driverCar ?? ""}
                          </span>
                        </div>
                        <Button
                          isIconOnly
                          aria-label="تماس با راننده"
                          className="text-green-700"
                          isDisabled={!onOpenCall}
                          size="sm"
                          variant="light"
                          onPress={() =>
                            onOpenCall &&
                            onOpenCall(
                              (t as any).driverName,
                              (t as any).driverPhone,
                            )
                          }
                        >
                          <Icon icon="ion:call" width={18} />
                        </Button>
                        <Button
                          color="primary"
                          size="sm"
                          startContent={
                            <Icon
                              className=""
                              icon="fa7-regular:edit"
                              width={16}
                            />
                          }
                          variant="flat"
                          onPress={() => onOpenAssign(t.id)}
                        >
                          تغییر راننده
                        </Button>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-3">
                        <Button
                          color="primary"
                          size="sm"
                          variant="solid"
                          onPress={() => onOpenAssign(t.id)}
                        >
                          انتخاب راننده
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
                {typeof groupBreakIndex === "number" &&
                idx === groupBreakIndex - 1 &&
                groupBreakIndex > 0 &&
                groupBreakIndex < trips.length ? (
                  <tr>
                    <td className="py-2" colSpan={4}>
                      <div className="border-t border-default-200" />
                    </td>
                  </tr>
                ) : null}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
