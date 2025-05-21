"use client";

import React, { useEffect, useState } from "react";
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
import { Icon } from "@iconify/react";

const PersianDate = require("persian-date");

export const columns = [
  { name: " ", uid: "Status", sortable: true },
  { name: "مسیر و حرکت", uid: "Direction", sortable: true },
  { name: "خودرو", uid: "Detail", sortable: true },
  { name: "راننده", uid: "Driver", sortable: true },
  { name: "STATUS", uid: "status", sortable: true },
  { name: "ACTIONS", uid: "actions" },
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

  // Fetch trips from your API route
  useEffect(() => {
    setLoading(true);
    fetch("/manage/upcoming/api/upcomings?day=2025-10-01")
      .then((res) => res.json())
      .then((data) => {
        setTrips(data);
        setLoading(false);
      })
      .catch(() => setLoading(false)); // Handle errors gracefully
  }, []);

  const filteredItems = React.useMemo(() => {
    let filtered = [...trips];
    if (filterValue) {
      filtered = filtered.filter((trip) =>
        trip.TicketCode.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    return filtered;
  }, [trips, filterValue]);

  const renderCell = React.useCallback((trip, columnKey) => {
    const cellValue = trip[columnKey];
    switch (columnKey) {
      case "Status":
        return (
          <Chip
            className="capitalize"
            color="danger"
            size="sm"
            variant="outlined"
          >
            !
          </Chip>
        );

      case "Direction":
        const startDateTime = new Date(trip.StartsAt); // Convert StartsAt to a Date object
        const persian_start_date = new PersianDate(startDateTime.getTime()); // Pass the timestamp to PersianDate
        return (
          <>
            <Chip
              variant="flat"
              className="text-medium font-bold   "
              startContent={
                <Icon
                  icon="solar:clock-circle-broken"
                  className="text-default-600"
                  width={22}
                ></Icon>
              }
              color="primary"
            >
              {persian_start_date.format("HH:mm")}{" "}
            </Chip>

            <div className="flex md:flex-row  flex-col gap-1">
              <span className="text-default-700 font-bold">
                {trip.OriginCity}
              </span>
              <span className="text-default-600 text-sm font-light">به</span>
              <span className="text-default-700 font-bold">
                {trip.DestinationCity}
              </span>
            </div>
          </>
        );

      case "Detail":
        return (
          <div className="flex flex-col gap-1">
            <Chip variant="bordered" className="rounded-lg" color="warning">
              <span className="text-default-700">{trip.CarName}</span>
            </Chip>
          </div>
        );
      case "actions":
        return (
          <div className="relative flex justify-end items-center gap-2">
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly size="sm" variant="light">
                  ...
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem key="view">View</DropdownItem>
                <DropdownItem key="edit">Edit</DropdownItem>
                <DropdownItem key="delete">Delete</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  const onSearchChange = React.useCallback((value) => {
    if (value) {
      setFilterValue(value);
    } else {
      setFilterValue("");
    }
  }, []);

  const topContent = React.useMemo(
    () => (
      <div className="flex justify-between items-center">
        <Input
          isClearable
          placeholder="Search by Ticket Code..."
          value={filterValue}
          onClear={() => setFilterValue("")}
          onValueChange={onSearchChange}
        />
      </div>
    ),
    [filterValue, onSearchChange]
  );

  return (
    <Table
      isHeaderSticky
      aria-label="Trips table with custom cells and sorting"
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
        emptyContent={loading ? "درحال بارگزاری سفرها ..." : "سفری پیدا نشد ❌"}
        items={filteredItems}
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
  );
}
