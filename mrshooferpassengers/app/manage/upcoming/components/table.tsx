"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
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

export default function TripsTable() {
  const [filterValue, setFilterValue] = useState("");
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state for assigning driver
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | number | null>(
    null
  );

  // Fetch trips from your API route (useCallback for reuse)
  const fetchTrips = useCallback(() => {
    setLoading(true);
    fetch("/manage/upcoming/api/upcomings?day=2025-10-01")
      .then((res) => res.json())
      .then((data) => {
        setTrips(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  // Filtering logic
  const filteredItems = useMemo(() => {
    let filtered = [...trips];
    if (filterValue) {
      filtered = filtered.filter((trip) =>
        trip.TicketCode?.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    return filtered;
  }, [trips, filterValue]);

  // Split and sort trips
  const tripsWithoutDriver = useMemo(
    () =>
      filteredItems
        .filter((trip) => !trip.Driver)
        .sort((a, b) => new Date(a.StartsAt) - new Date(b.StartsAt)),
    [filteredItems]
  );
  const tripsWithDriver = useMemo(
    () =>
      filteredItems
        .filter((trip) => !!trip.Driver)
        .sort((a, b) => new Date(a.StartsAt) - new Date(b.StartsAt)),
    [filteredItems]
  );

  // Table cell rendering
  const renderCell = useCallback((trip, columnKey) => {
    const cellValue = trip[columnKey];
    const hasLocation = trip.Location ? true : false;
    const hasDriver = trip.Driver ? true : false;

    switch (columnKey) {
      case "Status":
        return (
          <div
            className={`flex items-center justify-center rounded-full
        ${hasDriver ? "bg-success-100" : " border border-default-500"}
        ${hasDriver ? "" : "text-yellow-600"}
        w-9 h-9 mx-auto`}
          >
            {hasDriver ? (
              <Icon
                icon="solar:check-read-line-duotone"
                width={24}
                className="align-middle text-default-800"
              />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
            )}
          </div>
        );

      case "Direction":
        const startDateTime = new Date(trip.StartsAt);
        const persian_start_date = new PersianDate(startDateTime.getTime());
        return (
          <>
            <div className="flex md:flex-row flex-col gap-1">
              <span className="text-default-700 font-bold">
                {trip.OriginCity}
              </span>
              <span className="text-default-600 text-sm font-light">به</span>
              <span className="text-default-700 font-bold">
                {trip.DestinationCity}
              </span>
            </div>

            <Chip
              variant="flat"
              className="text-medium font-bold mt-1"
              startContent={
                <Icon
                  icon="solar:clock-circle-broken"
                  className="text-default-600"
                  width={22}
                />
              }
              color="primary"
            >
              {persian_start_date.format("HH:mm")}{" "}
            </Chip>

            <span className="block text-xs font-extralight">
              {trip.TicketCode}
            </span>
          </>
        );

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
          <div className="relative flex justify-start items-center gap-2">
            <div className="flex flex-col">
              <span className="text-default-700 flex items-start text-xs font-extralight gap-1">
                <Icon
                  icon={
                    hasLocation
                      ? "solar:map-point-favourite-line-duotone"
                      : "solar:map-point-remove-line-duotone"
                  }
                  className={hasLocation ? "text-defult" : "text-danger"}
                  width={18}
                />
                {hasLocation ? "دارای‌مبدا" : "بدون لوکیشن"}
              </span>
              <span className="text-default-700 font-light text-xs ">
                {trip.Passenger.Firstname} {trip.Passenger.Lastname}
              </span>
              <span className="text-default-700 font-light text-xs">
                {trip.Passenger.NumberPhone}
              </span>
            </div>
          </div>
        );
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

  const onSearchChange = useCallback((value) => {
    if (value) {
      setFilterValue(value);
    } else {
      setFilterValue("");
    }
  }, []);

  const topContent = useMemo(
    () => (
      <div className="flex justify-between items-center">
        <Input
          isClearable
          placeholder="جستجو ( نام راننده، مسافر، شماره تلفن، رفرنس ... )"
          value={filterValue}
          onClear={() => setFilterValue("")}
          onValueChange={onSearchChange}
        />
      </div>
    ),
    [filterValue, onSearchChange]
  );

  return (
    <>
      <div className="mb-8 mt-5">
        <div className="font-bold text-md mb-2">سفرهای بدون راننده</div>
        <Table
          isHeaderSticky
          aria-label="Trips without driver"
          topContent={topContent}
          topContentPlacement="outside"
          sortDescriptor={{ column: "StartsAt", direction: "ascending" }}
          isLoading={loading}
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "actions" ? "center" : "start"}
                allowsSorting={column.sortable}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            emptyContent={
              loading ? "درحال بارگزاری سفرها ..." : "🛣️ همه چی مرتبه... 😉"
            }
            items={tripsWithoutDriver}
          >
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div>
        <div className="font-bold text-md mb-2 text-success-600">
          سفرهای دارای راننده
        </div>
        <Table
          isHeaderSticky
          aria-label="Trips with driver"
          topContent={null}
          sortDescriptor={{ column: "StartsAt", direction: "ascending" }}
          isLoading={loading}
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.uid}
                align={column.uid === "actions" ? "center" : "start"}
                allowsSorting={column.sortable}
              >
                {column.name}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            emptyContent={
              loading
                ? "درحال بارگزاری سفرها ..."
                : "سفری دارای راننده پیدا نشد ❌"
            }
            items={tripsWithDriver}
          >
            {(item) => (
              <TableRow key={item.id}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
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
            duration: 3000,
            variant: "bordered",
          });
        }}
      />
    </>
  );
}
