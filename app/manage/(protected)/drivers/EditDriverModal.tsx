"use client";
import React, { useState, useEffect } from "react";
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

interface EditDriverModalProps {
  open: boolean;
  driverId: number | null;
  onClose: () => void;
  onDriverUpdated?: (driver: any) => void;
}

export default function EditDriverModal({
  open,
  driverId,
  onClose,
  onDriverUpdated,
}: EditDriverModalProps) {
  const [Firstname, setFirstname] = useState("");
  const [Lastname, setLastname] = useState("");
  const [PhoneNumber, setPhoneNumber] = useState("");
  const [CarName, setCarName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (open && driverId) {
      setFetching(true);
      setError("");
      fetch(`/manage/api/drivers/${driverId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          setFirstname(data.Firstname || "");
          setLastname(data.Lastname || "");
          setPhoneNumber(data.PhoneNumber || "");
          setCarName(data.CarName || "");
        })
        .catch((err) => setError(err.message || "خطا در دریافت اطلاعات راننده"))
        .finally(() => setFetching(false));
    }
    if (!open) {
      setFirstname("");
      setLastname("");
      setPhoneNumber("");
      setCarName("");
      setError("");
    }
  }, [open, driverId]);

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
      const res = await fetch(`/manage/api/drivers/${driverId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Firstname, Lastname, PhoneNumber, CarName }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "خطا در ویرایش راننده");
      if (onDriverUpdated) onDriverUpdated(data);
      addToast({
        title: "ویرایش راننده",
        description: "اطلاعات راننده با موفقیت ویرایش شد.",
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ویرایش راننده");
    }
    setLoading(false);
  };

  return (
    <Modal
      className="z-[9999]"
      classNames={{
        base: "m-0 h-[100dvh] rounded-none sm:m-6 sm:h-auto sm:rounded-3xl",
        wrapper: "w-full h-[100dvh] sm:h-auto sm:max-w-3xl",
        body: "overflow-y-auto max-h-[calc(100dvh-220px)] sm:max-h-[70vh]",
      }}
      isOpen={open}
      placement="center"
      scrollBehavior="inside"
      size="2xl"
      onClose={onClose}
    >
      <ModalContent className="w-full h-full sm:h-auto sm:max-w-2xl">
        <ModalHeader className="flex flex-col gap-2 items-start">
          <div className="flex items-center gap-2 w-full">
            <Icon
              className="text-primary"
              icon="fluent-color:clipboard-text-edit-20"
              width={32}
            />
            <span className="font-bold text-lg">ویرایش راننده</span>
          </div>
        </ModalHeader>
        <form noValidate className="w-full" onSubmit={handleSubmit}>
          <ModalBody className="space-y-3">
            {fetching ? (
              <div className="text-center py-8">در حال دریافت اطلاعات...</div>
            ) : (
              <>
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
              </>
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
              isLoading={loading || fetching}
              type="submit"
            >
              ذخیره تغییرات
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
