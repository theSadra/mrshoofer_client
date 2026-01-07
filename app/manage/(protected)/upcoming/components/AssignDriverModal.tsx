"use client";
import React, { useEffect, useState } from "react";
import { Input, Button, Spinner } from "@heroui/react";
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
        driver.CarName?.toLowerCase().includes(searchValue),
    );

    setDrivers(filtered);
  };

  // Assign driver to trip
  const assignDriver = async (driverId: string | number) => {
    setAssigningDriverId(driverId);
    setError("");
    try {
      console.log("Assigning driver:", { driverId, tripId });

      const res = await fetch(`/manage/api/drivers/assign-driver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId, tripId }),
      });

      const data = await res.json();

      console.log("API Response:", { status: res.status, ok: res.ok, data });

      if (!res.ok) {
        throw new Error(
          data.error || `HTTP ${res.status}: خطا در انتساب راننده`,
        );
      }

      if (data.success) {
        console.log("Driver assigned successfully");
        if (onAssigned) onAssigned(driverId);
        onClose();
      } else {
        throw new Error(data.error || "خطا در انتساب راننده");
      }
    } catch (error) {
      console.error("Error assigning driver:", error);
      setError(error instanceof Error ? error.message : "خطا در انتساب راننده");
    }
    setAssigningDriverId(null);
  };

  // Handle mobile viewport height issues
  useEffect(() => {
    if (open) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
      // Fix mobile viewport height
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`,
      );

      const handleResize = () => {
        document.documentElement.style.setProperty(
          "--vh",
          `${window.innerHeight * 0.01}px`,
        );
      };

      window.addEventListener("resize", handleResize);

      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("resize", handleResize);
      };
    }
  }, [open]);

  return (
    <Modal
      className="z-[9999]"
      classNames={{
        base: "m-0 sm:m-6",
        wrapper: "w-full h-[100dvh] sm:w-auto sm:h-auto",
        body: "overflow-y-auto max-h-none sm:max-h-[60vh]",
      }}
      isOpen={open}
      scrollBehavior="inside"
      size="full"
      style={
        {
          "--modal-height": "calc(var(--vh, 1vh) * 100)",
        } as React.CSSProperties
      }
      onClose={onClose}
    >
      <ModalContent className="overflow-visible z-[9999] h-full sm:h-auto modal-content-full">
        <ModalHeader className="flex flex-col gap-2 items-start min-h-20 flex-shrink-0">
          <div className="flex items-center gap-2 w-full">
            <Icon
              className="text-secondary-400"
              icon="solar:user-check-rounded-bold-duotone"
              width={32}
            />
            <span className="font-bold text-lg text-center ms-1">
              انتخاب راننده
            </span>
          </div>
          <div className="relative w-full">
            <Input
              className=""
              placeholder="جستجو راننده (نام، نام خانوادگی، شماره، خودرو)"
              startContent={
                <svg
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
              value={search}
              onChange={handleSearch}
            />
          </div>
        </ModalHeader>
        <ModalBody className="flex-1 overflow-y-auto overflow-x-visible sm:max-h-[60vh] sm:flex-none modal-body-full">
          {loading ? (
            <div className="flex justify-center items-center h-full min-h-[250px]">
              <Spinner />
            </div>
          ) : error ? (
            <div className="text-danger text-center">{error}</div>
          ) : drivers.length === 0 ? (
            <div className="flex flex-col items-center justify-start h-full min-h-[250px]">
              {!showAddCard ? (
                <Button
                  className="mt-4"
                  color="primary"
                  variant="flat"
                  onClick={() => setShowAddCard(true)}
                >
                  <Icon height={24} icon="basil:add-outline" width={24} />
                  افزودن راننده جدید
                </Button>
              ) : (
                <div className="w-full max-w-md mx-auto">
                  <div className="bg-white border border-default-200 rounded-xl shadow p-4 w-full">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon
                        className="text-primary-500"
                        icon="solar:user-plus-rounded-bold-duotone"
                        width={28}
                      />
                      <span className="font-bold text-base">
                        افزودن راننده جدید
                      </span>
                    </div>
                    <form
                      className="space-y-3"
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
                            method: "PUT",
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
                            throw new Error(
                              data.error || "خطا در ایجاد راننده جدید",
                            );
                          setAllDrivers((prev) => [...prev, data]);
                          setDrivers((prev) => [...prev, data]);
                          setShowAddCard(false);
                        } catch (err: any) {
                          alert(err.message || "خطا در ایجاد راننده جدید");
                        }
                      }}
                    >
                      <Input
                        required
                        className="w-full"
                        labelPlacement="outside"
                        name="Firstname"
                        placeholder="نام"
                      />
                      <Input
                        required
                        className="w-full"
                        labelPlacement="outside"
                        name="Lastname"
                        placeholder="نام خانوادگی"
                      />
                      <Input
                        required
                        className="w-full text-right"
                        labelPlacement="outside"
                        name="PhoneNumber"
                        pattern="[0-9]+"
                        placeholder="شماره تماس"
                        type="tel"
                      />
                      <Input
                        required
                        className="w-full"
                        labelPlacement="outside"
                        name="CarName"
                        placeholder="نام خودرو"
                      />
                      <div className="flex gap-2 mt-2">
                        <Button
                          className="w-full"
                          color="danger"
                          type="button"
                          variant="light"
                          onClick={() => setShowAddCard(false)}
                        >
                          انصراف
                        </Button>
                        <Button
                          className="w-full"
                          color="primary"
                          type="submit"
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
                        className="text-yellow-600"
                        icon="solar:user-id-line-duotone"
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
                    color="primary"
                    isLoading={assigningDriverId === driver.id}
                    size="sm"
                    variant="flat"
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
          <Button color="danger" variant="light" onClick={onClose}>
            بستن
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
