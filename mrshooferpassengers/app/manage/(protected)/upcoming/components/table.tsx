"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
} from "@heroui/react";
import { addToast } from "@heroui/toast";
import { Icon } from "@iconify/react";
import AssignDriverModal from "./AssignDriverModal";
import { useDisclosure } from "@heroui/react";

const PersianDate = require("persian-date");

// Add Trip type for strong typing
interface Trip {
  id: string | number;
  status: string;
  StartsAt: string | Date;
  OriginCity: string;
  DestinationCity: string;
  CarName: string;
  TicketCode: string;
  Driver?: {
    Firstname: string;
    Lastname: string;
    PhoneNumber: string;
    CarName: string;
  } | null;
  Location?: any;
  [key: string]: any;
}

export const columns = [
  { name: " ", uid: "Status", sortable: true },
  { name: "مسیر و حرکت", uid: "Direction", sortable: true },
  { name: "خودرو", uid: "Detail", sortable: true },
  { name: "راننده", uid: "Driver", sortable: true },
  { name: "مسافر", uid: "passenger", sortable: true },
  // { name: "ACTIONS", uid: "actions" },
];

const statusColorMap = {
  wating_info: "warning",
  wating_start: "primary",
  intrip: "success",
  done: "success",
};

const statustextmap = {
  wating_info: "انتظار مبدا",
  wating_start: "انتظار شروع",
  intrip: "درحال سفر",
  done: "پایان یافته",
};

export default function TripsTable({ day, onTripsChanged, refreshKey }: { day: string; onTripsChanged?: () => void; refreshKey?: number }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state for assigning driver
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | number | null>(null);

  // Fetch trips function
  const fetchTrips = useCallback(() => {
    setLoading(true);
    fetch(`/manage/upcoming/api/upcomings?day=${day}`)
      .then((res) => res.json())
      .then((data) => {
        setTrips(data);
        setLoading(false);
        if (onTripsChanged) onTripsChanged(); // این خط اضافه شود
      })
      .catch(() => setLoading(false));
  }, [day, onTripsChanged]);

  // Fetch trips when day or refreshKey changes
  useEffect(() => {
    fetchTrips();
  }, [fetchTrips, refreshKey]);

  // Filtering logic (removed search)
  const filteredItems = trips;

  // Split and sort trips
  const tripsWithoutDriver = useMemo(
    () =>
      filteredItems
        .filter((trip: Trip) => !trip.Driver)
        .sort(
          (a: Trip, b: Trip) =>
            new Date(a.StartsAt).getTime() - new Date(b.StartsAt).getTime()
        ),
    [filteredItems]
  );
  const tripsWithDriver = useMemo(
    () =>
      filteredItems
        .filter((trip: Trip) => !!trip.Driver)
        .sort(
          (a: Trip, b: Trip) =>
            new Date(a.StartsAt).getTime() - new Date(b.StartsAt).getTime()
        ),
    [filteredItems]
  );

  // Table cell rendering
  const renderCell = useCallback((trip: Trip, columnKey: string) => {
    const cellValue = trip[columnKey];
    const hasLocation = trip.Location ? true : false;
    const hasDriver = trip.Driver ? true : false;

    switch (columnKey) {
      case "Status": {
        const startDateTime = new Date(trip.StartsAt);
        const now = new Date();

        // Check if trip is today
        const isToday =
          startDateTime.getFullYear() === now.getFullYear() &&
          startDateTime.getMonth() === now.getMonth() &&
          startDateTime.getDate() === now.getDate();

        let remainMins = null;
        remainMins = Math.floor((startDateTime.getTime() - now.getTime()) / (1000 * 60));

        // Determine background and icon color
        let bgClass = "bg-gray-100";
        let iconClass = "text-gray-400";
        if (hasDriver) {
          bgClass = "bg-success-100";
          iconClass = "text-success-700";
        } else if (isToday && remainMins !== null) {
          if (remainMins > 120) {
            bgClass = "bg-warning-100";
            iconClass = "text-warning-700";
          } else if (remainMins >= 60) {
            bgClass = "bg-warning-300";
            iconClass = "text-warning-700";
          } else if (remainMins >= 30) {
            bgClass = "bg-danger-500";
            iconClass = "text-white";
          } else if (remainMins > 0) {
            bgClass = "bg-danger-500";
            iconClass = "text-white";
          } else {
            bgClass = "bg-gray-100";
            iconClass = "text-danger-300";
          }
        } else if (!isToday) {
          // For tomorrow and other future days, use a blue background and icon
          bgClass = "bg-warning-100";

          iconClass = "text-warning-600";
        }

        return (
          <div
            className={`flex items-center justify-center rounded-full border border-default-500 w-9 h-9 mx-auto ${bgClass}`}
          >
            {hasDriver ? (
              <Icon
                icon="solar:check-read-line-duotone"
                width={24}
                className={`align-middle ${iconClass}`}
              />
            )
              : remainMins > 120 ? (
                // زرد: بیشتر از ۲ ساعت
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6 ${iconClass}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>

              ) : remainMins >= 60 ? (
                // زرد: بین ۱ تا ۲ ساعت
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6 ${iconClass}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>

              ) : remainMins >= 30 ? (
                // نارنجی: بین ۳۰ تا ۶۰ دقیقه
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6 ${iconClass}`}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>

              ) : remainMins > 0 ? (
                // قرمز: کمتر از ۳۰ دقیقه
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6 ${iconClass}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>

              ) : (

                // خاکستری: گذشته
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className={`size-6 ${iconClass}`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                  />
                </svg>

              )
            }
          </div >
        );
      }

      case "Direction": {
        const startDateTime = new Date(trip.StartsAt);
        const persian_start_date = new PersianDate(startDateTime.getTime());
        return (
          <div className="flex flex-col w-full">
            <div className="flex justify-evenly items-center w-full mt-1">
              <span className="text-blue-900 font-bold text-md break-words whitespace-normal">{trip.OriginCity}</span>
              <span className="text-blue-400 text-lg font-bold mx-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75 3 12m0 0 3.75-3.75M3 12h18" />
                </svg>

              </span>
              <span className="text-blue-900 font-bold text-md break-words whitespace-normal ">{trip.DestinationCity}</span>
            </div>
            <div className="flex items-center w-full mt-1">
              <Chip
                variant="flat"
                className="bg-blue-600 text-white px-3 py-1 text-lg font-extrabold tracking-wide shadow min-w-[64px] justify-center border border-blue-700"
                startContent={
                  <Icon
                    icon="solar:clock-circle-broken"
                    className="text-white"
                    width={18}
                  />
                }
                color="primary"
              >
                {persian_start_date.format("HH:mm")}
              </Chip>
              <span className="flex-1" />

              <span className="text-xs text-blue-400 font-light px-1 truncate max-w-[80px] text-left">
                {trip.TicketCode}</span>
            </div>
          </div >
        );
      }

      case "Detail":
        return (
          <div className="flex flex-col gap-1">


            <Chip
              variant="faded"
              size="sm"
              className="rounded-lg text-sm font-light text-default-700"
              color="warning"
            >
              <span className="text-default-700">{trip.CarName}</span>
            </Chip>

          </div>
        );

      case "Driver":
        return trip.Driver ? (
          <div className="w-fit relative">
            {/* Edit button at top-right */}
            <div className="flex flex-col justify-start items-start ">
              <div className="flex">
                <Icon
                  icon="solar:user-id-line-duotone"
                  className="text-default-700"
                  width={20}
                />
                <span className="ms-1 text-sm font-light">
                  {trip.Driver.Firstname} {trip.Driver.Lastname}
                </span>
                <button
                  type="button"
                  className=" top-1 left-1 ms-1 p-1 rounded-full hover:bg-default-200 transition"
                  title="تغییر راننده"
                  onClick={() => {
                    setSelectedTripId(trip.id);
                    setAssignModalOpen(true);
                  }}
                >
                  <Icon
                    icon="solar:pen-new-square-broken"
                    width={14}
                    className="text-primary-500"
                  />
                </button>
              </div>
              <div>
                <a
                  href={`tel:${trip.Driver.PhoneNumber}`}
                  className="text-blue-600 underline text-xs mt-1"
                >
                  {trip.Driver.PhoneNumber}
                </a>
                <span className="font-light text-xs ms-1 text-warning">
                  {trip.Driver.CarName}
                </span>
              </div>
            </div>

          </div>
        ) : (
          <div>
            <Button
              size="sm"
              variant="flat"
              color="primary"
              className="shadow"
              startContent={
                <Icon icon="solar:user-plus-rounded-broken" width={22} />
              }
              onClick={() => {
                setSelectedTripId(trip.id);
                setAssignModalOpen(true);
              }}
            >
              انتخاب راننده
            </Button>
          </div>
        );
      case "passenger":

        return (
          // Do not render anything and do not render the cell in the card layout
          <span className="text-xs  text-blue-400 font-light px-1  max-w-[60px]">

            پیگیری : {trip.TicketCode}</span>);
      // case "actions":
      //   return (
      //     <div className="relative flex justify-end items-center gap-2">
      //       <Dropdown>
      //         <DropdownTrigger>
      //           <Button isIconOnly size="sm" variant="light">
      //             ...
      //           </Button>
      //         </DropdownTrigger>
      //         <DropdownMenu>
      //           <DropdownItem key="view">View</DropdownItem>
      //           <DropdownItem key="edit">Edit</DropdownItem>
      //           <DropdownItem key="delete">Delete</DropdownItem>
      //         </DropdownMenu>
      //       </Dropdown>
      //     </div>
      //   );
      default:
        return cellValue;
    }
  }, []);

  const topContent = null;

  return (
    <>
      <div className="mb-10 mt-6">
        <div className="font-bold text-lg mb-3 text-warning-700 flex items-center gap-2">
          <Icon icon="solar:user-plus-rounded-broken" width={22} className="text-warning-700" />
          سفرهای بدون راننده
        </div>
        <div className="bg-gradient-to-br from-yellow-50 via-white to-yellow-100 rounded-xl shadow-sm p-3 sm:p-4 border border-warning-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {tripsWithoutDriver.length === 0 && (
              <div className="col-span-full text-center text-default-500 py-8">
                {loading ? "درحال بارگزاری سفرها ..." : "🛣️ همه چی مرتبه... 😉"}
              </div>
            )}
            {tripsWithoutDriver.map((item) => (
              <div key={item.id} className="bg-white/80 hover:bg-yellow-50 transition rounded-xl shadow p-3 flex flex-col gap-2 border border-default-200 relative">
                {item.status === "canceled" && (
                  <Chip
                    size="sm"
                    color="danger"
                    className="absolute -top-3 -left-3 sm:-top-3 sm:-left-3 z-20 text-xs font-bold shadow-lg"
                    variant="solid"
                  >
                    کنسل شده
                  </Chip>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  {renderCell(item, "Status")}
                  <span className="flex-1 min-w-0 truncate">{renderCell(item, "Direction")}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-default-500">
                  <span className="font-bold text-default-700 text-base flex-1 truncate">{item.CarName}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex-1 min-w-0 truncate">{renderCell(item, "Driver")}</span>
                  {/* Passenger cell removed for better UI/UX */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-10">
        <div className="font-bold text-lg mb-3 text-success-700 flex items-center gap-2">
          <Icon icon="solar:user-id-line-duotone" width={22} className="text-success-700" />
          سفرهای دارای راننده
        </div>
        <div className="bg-gradient-to-br from-green-50 via-white to-green-100 rounded-xl shadow-sm p-3 sm:p-4 border border-success-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {tripsWithDriver.length === 0 && (
              <div className="col-span-full text-center text-default-500 py-8">
                {loading ? "درحال بارگزاری سفرها ..." : "سفری دارای راننده پیدا نشد ❌"}
              </div>
            )}
            {tripsWithDriver.map((item) => (
              <div key={item.id} className="bg-white/80 hover:bg-green-50 transition rounded-xl shadow p-3 flex flex-col gap-2 border border-default-200 relative">
                {item.status === "canceled" && (
                  <Chip
                    size="sm"
                    color="danger"
                    className="absolute -top-3 -left-3 sm:-top-3 sm:-left-3 z-20 text-xs font-bold shadow-lg"
                    variant="solid"
                  >
                    کنسل شده
                  </Chip>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  {renderCell(item, "Status")}
                  <span className="flex-1 min-w-0 truncate">{renderCell(item, "Direction")}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-default-500">
                  <span className="font-bold text-default-700 text-base flex-1 truncate">{item.CarName}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex-1 min-w-0 truncate">{renderCell(item, "Driver")}</span>
                  {/* Passenger cell removed for better UI/UX */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AssignDriverModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        tripId={selectedTripId ?? ""}
        onAssigned={() => {
          setAssignModalOpen(false);
          fetchTrips();
          addToast({
            title: "انتساب راننده موفقیت آمیز بود",
            description:
              "راننده برای سفر انتخاب شده، تعیین شد. آدرس مبدا و اطلاعات مسافر به شماره همراه راننده ارسال خواهد شد",
            color: "success",
            timeout: 3000, // changed from duration to timeout
            variant: "bordered",
          });
        }}
      />
    </>
  );
}
