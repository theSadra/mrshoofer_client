"use client";
import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Input, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/toast";

interface AddDriverModalProps {
  open: boolean;
  onClose: () => void;
  onDriverAdded?: (driver: any) => void;
}

export default function AddDriverModal({
  open,
  onClose,
  onDriverAdded,
}: AddDriverModalProps) {
  const [Firstname, setFirstname] = useState("");
  const [Lastname, setLastname] = useState("");
  const [PhoneNumber, setPhoneNumber] = useState("");
  const [CarName, setCarName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!Firstname.trim()) {
      setError("لطفاً نام راننده را وارد کنید.");
      setLoading(false);

      return;
    }
    if (!Lastname.trim()) {
      setError("لطفاً نام خانوادگی راننده را وارد کنید.");
      setLoading(false);

      return;
    }
    if (!PhoneNumber.trim()) {
      setError("لطفاً شماره تماس راننده را وارد کنید.");
      setLoading(false);

      return;
    }
    if (!CarName.trim()) {
      setError("لطفاً نام خودرو را وارد کنید.");
      setLoading(false);

      return;
    }
    try {
      const res = await fetch("/manage/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Firstname, Lastname, PhoneNumber, CarName }),
      });
      let data = null;
      const contentType = res.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      }
      if (!res.ok)
        throw new Error((data && data.error) || "خطا در ایجاد راننده جدید");
      if (onDriverAdded) onDriverAdded(data);
      setFirstname("");
      setLastname("");
      setPhoneNumber("");
      setCarName("");
      // Show toast after successful driver creation
      addToast({
        title: "راننده جدید",
        description: "راننده جدید با موفقیت اضافه شد.",
        color: "success",
      });
      onClose();
    } catch (err: any) {
      setError(err.message || "خطا در ایجاد راننده جدید");
    }
    setLoading(false);
  };

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
      <ModalContent className="max-w-md w-full">
        <ModalHeader className="flex flex-col gap-2 items-start">
          <div className="flex items-center gap-2 w-full">
            <Icon
              className="text-primary-500"
              icon="solar:user-plus-rounded-bold-duotone"
              width={32}
            />
            <span className="font-bold text-lg">افزودن راننده جدید</span>
          </div>
        </ModalHeader>
        <form noValidate className="w-full" onSubmit={handleSubmit}>
          <ModalBody className="space-y-3">
            <Input
              required
              className="w-full"
              label={
                <span>
                  نام راننده <span className="text-danger">*</span>
                </span>
              }
              placeholder="نام راننده را وارد کنید"
              value={Firstname}
              variant="bordered"
              onChange={(e) => setFirstname(e.target.value)}
            />
            <Input
              required
              className="w-full"
              label={
                <span>
                  نام خانوادگی راننده <span className="text-danger">*</span>
                </span>
              }
              placeholder="نام خانوادگی راننده را وارد کنید"
              value={Lastname}
              variant="bordered"
              onChange={(e) => setLastname(e.target.value)}
            />
            <div>
              <Input
                required
                className="w-full"
                label={
                  <span>
                    شماره تماس <span className="text-danger">*</span>
                  </span>
                }
                pattern="[0-9]+"
                placeholder="شماره تماس راننده را وارد کنید"
                type="tel"
                value={PhoneNumber}
                variant="bordered"
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <div className="text-xs text-default-400 mt-1 mb-2">
                موقعیت مسافران، به شماره تلفن وارد شده ارسال خواهد شد
              </div>
            </div>
            <Input
              required
              className="w-full"
              label={
                <span>
                  نام خودرو <span className="text-danger">*</span>
                </span>
              }
              placeholder="نام خودرو را وارد کنید"
              value={CarName}
              variant="bordered"
              onChange={(e) => setCarName(e.target.value)}
            />
            {error && (
              <div className="text-danger text-sm text-center">{error}</div>
            )}
          </ModalBody>
          <ModalFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <Button
              className="w-full sm:w-auto"
              color="danger"
              type="button"
              variant="light"
              onClick={onClose}
            >
              بستن
            </Button>
            <Button
              className="w-full sm:w-auto"
              color="primary"
              isLoading={loading}
              type="submit"
            >
              افزودن راننده
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
