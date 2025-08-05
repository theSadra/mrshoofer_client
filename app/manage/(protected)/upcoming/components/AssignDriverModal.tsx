"use client";
import React, { useEffect, useState } from "react";
import { Input, Button, Spinner } from "@heroui/react";
import { addToast } from "@heroui/react";
import { Icon } from "@iconify/react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Driver } from "@prisma/client";
import carnamesRaw from "./carnames.json";

const carnames: string[] = Array.isArray(carnamesRaw) ? carnamesRaw : [];

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
  const [showAddCard, setShowAddCard] = useState(false);
  const [addCardCarName, setAddCardCarName] = useState(""); // Add state for CarName in the inline add-driver form

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

  // Reset addCardCarName when modal closes or add card closes
  useEffect(() => {
    if (!open || !showAddCard) {
      setAddCardCarName("");
    }
  }, [open, showAddCard]);

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
      console.log('Assigning driver:', { driverId, tripId });

      const res = await fetch(`/manage/api/drivers/assign-driver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId, tripId }),
      });

      const data = await res.json();
      console.log('API Response:', { status: res.status, ok: res.ok, data });

      if (!res.ok) {
        throw new Error(data.error || `HTTP ${res.status}: خطا در انتساب راننده`);
      }

      if (data.success) {
        console.log('Driver assigned successfully');
        if (onAssigned) onAssigned(driverId);
        onClose();
      } else {
        throw new Error(data.error || "خطا در انتساب راننده");
      }
    } catch (error) {
      console.error('Error assigning driver:', error);
      setError(error instanceof Error ? error.message : "خطا در انتساب راننده");
    }
    setAssigningDriverId(null);
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      scrollBehavior="inside"
      className="z-[9999]"
    >
      <ModalContent className="overflow-visible z-[9999]">
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
        <ModalBody className="h-auto max-h-[60vh] overflow-y-auto overflow-x-visible">
          {loading ? (
            <div className="flex justify-center items-center h-full min-h-[250px]">
              <Spinner />
            </div>
          ) : error ? (
            <div className="text-danger text-center">{error}</div>
          ) : drivers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[250px]">
              {!showAddCard ? (
                <Button
                  color="primary"
                  variant="flat"
                  className="mt-4"
                  onClick={() => setShowAddCard(true)}
                >
                  افزودن راننده جدید
                </Button>
              ) : (
                <div className="w-full max-w-md mx-auto">
                  <div className="bg-white border border-default-200 rounded-xl shadow p-4 w-full">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon
                        icon="solar:user-plus-rounded-bold-duotone"
                        className="text-primary-500"
                        width={28}
                      />
                      <span className="font-bold text-base">
                        افزودن راننده جدید
                      </span>
                    </div>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const Firstname = form["Firstname"].value;
                        const Lastname = form["Lastname"].value;
                        const PhoneNumber = form["PhoneNumber"].value;
                        const CarName = form["CarName"].value; // Use the input value directly
                        if (!CarName) {
                          alert("لطفا یک خودرو انتخاب کنید");
                          return;
                        }
                        try {
                          const res = await fetch("/manage/api/drivers", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              Firstname,
                              Lastname,
                              PhoneNumber,
                              CarName,
                            }),
                          });
                          const data = await res.json();
                          if (!res.ok)
                            throw new Error(data.error || "خطا در ایجاد راننده جدید");
                          setAllDrivers((prev) => [...prev, data]);
                          setDrivers((prev) => [...prev, data]);
                          setShowAddCard(false);
                        } catch (err: any) {
                          alert(err.message || "خطا در ایجاد راننده جدید");
                        }
                      }}
                      className="space-y-3"
                    >
                      <Input
                        name="Firstname"
                        label="نام راننده"
                        required
                        className="w-full"
                      />
                      <Input
                        name="Lastname"
                        label="نام خانوادگی راننده"
                        required
                        className="w-full"
                      />
                      <Input
                        name="PhoneNumber"
                        label="شماره تماس"
                        required
                        className="w-full"
                        type="tel"
                        pattern="[0-9]+"
                      />
                      <Input
                        name="CarName"
                        label="نام خودرو"
                        required
                        className="w-full"
                      />
                      <div className="flex gap-2 mt-2">
                        <Button
                          type="button"
                          variant="light"
                          color="danger"
                          onClick={() => setShowAddCard(false)}
                          className="w-full"
                        >
                          انصراف
                        </Button>
                        <Button
                          type="submit"
                          color="primary"
                          className="w-full"
                        >
                          افزودن راننده
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <ul className="space-y-1 py-3">
              {drivers.map((driver) => (
                <li
                  key={driver.id}
                  className="flex items-center justify-between gap-4 px-2 p-1.5 border bg-default-50 border-default-200 rounded-xl  shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-9 h-9 rounded-full border bg-white border-default-300 shadow">
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
                    variant="flat"
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
