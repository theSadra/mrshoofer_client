"use client";
import React, { useEffect, useState } from "react";
import { Input, Button, Spinner } from "@heroui/react";
import { addToast, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Driver } from "@prisma/client";

interface AssignDriverModalProps {
  open: boolean;
  onClose: () => void;
  tripId: string | number;
  onAssigned?: (driverId: string | number) => void;
}

export default function AssignDriverModal({
  open,
  onClose,
  tripId,
  onAssigned,
}: AssignDriverModalProps) {
  const [allDrivers, setAllDrivers] = useState<Driver[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [assigningDriverId, setAssigningDriverId] = useState<
    string | number | null
  >(null);
  const [error, setError] = useState("");

  // Fetch all drivers once when modal opens
  useEffect(() => {
    if (open) {
      setLoading(true);
      setError("");
      fetch("/manage/api/drivers")
        .then((res) => res.json())
        .then((data) => {
          setAllDrivers(data);
          setDrivers(data);
          setLoading(false);
        })
        .catch(() => {
          setError("خطا در دریافت راننده‌ها");
          setLoading(false);
        });
    } else {
      setAllDrivers([]);
      setDrivers([]);
      setSearch("");
    }
  }, [open]);

  // Handle search input change (client-side filtering)
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    if (!value.trim()) {
      setDrivers(allDrivers);
      return;
    }

    const searchValue = value.trim().toLowerCase();
    const filtered = allDrivers.filter(
      (driver) =>
        driver.Firstname?.toLowerCase().includes(searchValue) ||
        driver.Lastname?.toLowerCase().includes(searchValue) ||
        driver.PhoneNumber?.toLowerCase().includes(searchValue) ||
        driver.CarName?.toLowerCase().includes(searchValue)
    );
    setDrivers(filtered);
  };

  // Assign driver to trip
  const assignDriver = async (driverId: string | number) => {
    setAssigningDriverId(driverId);
    setError("");
    try {
      const res = await fetch(`/manage/api/drivers/assign-driver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId, tripId }),
      });
      if (!res.ok) throw new Error();
      if (onAssigned) onAssigned(driverId);
      onClose();
    } catch {
      setError("خطا در انتساب راننده");
    }
    setAssigningDriverId(null);
  };

  return (
    <Modal isOpen={open} onClose={onClose} scrollBehavior="inside">
      <ModalContent className="max-h-[500px] h-[500px]">
        <ModalHeader className="flex flex-col gap-2 items-start min-h-20">
          <div className="flex items-center gap-2 w-full">
            <Icon
              icon="solar:user-check-rounded-bold-duotone"
              className="text-secondary-400"
              width={32}
            />
            <span className="font-bold text-lg text-center ms-1">
              انتخاب راننده
            </span>
          </div>
          <div className="relative w-full">
            <Input
              startContent={
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
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  />
                </svg>
              }
              placeholder="جستجو راننده (نام، نام خانوادگی، شماره، خودرو)"
              value={search}
              onChange={handleSearch}
              className=""
            />
          </div>
        </ModalHeader>
        <ModalBody className="overflow-y-auto h-full">
          {loading ? (
            <div className="flex justify-center items-center h-full min-h-[250px]">
              <Spinner />
            </div>
          ) : error ? (
            <div className="text-danger text-center">{error}</div>
          ) : drivers.length === 0 ? (
            <div className="flex justify-center items-center h-full min-h-[250px]">
              <span className="text-center text-default-500">
                راننده‌ای پیدا نشد
              </span>
            </div>
          ) : (
            <ul className="space-y-2">
              {drivers.map((driver) => (
                <li
                  key={driver.id}
                  className="flex items-center justify-between gap-4 px-2 p-1.5 border border-default-200 rounded-xl bg-white shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-9 h-9 rounded-full border border-default-300 bg-default-50 shadow">
                      <Icon
                        icon="solar:user-id-line-duotone"
                        className="text-yellow-600"
                        width={26}
                      />
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-default-600 text-sm">
                        {driver.Firstname} {driver.Lastname}
                      </span>
                      <span className="text-xs text-default-500 mt-1">
                        {driver.PhoneNumber}
                        {driver.CarName && (
                          <>
                            {" "}
                            |{" "}
                            <span className="font-semibold text-default-600">
                              {driver.CarName}
                            </span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    color="primary"
                    variant="ghost"
                    isLoading={assigningDriverId === driver.id}
                    onClick={() => assignDriver(driver.id)}
                  >
                    انتخاب
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" color="danger" onClick={onClose}>
            بستن
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
