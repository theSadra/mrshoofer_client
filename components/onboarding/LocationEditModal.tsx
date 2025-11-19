"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";
import { Icon } from "@iconify/react";

interface LocationEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  locationType: "origin" | "destination";
  locationAddress?: string;
}

export default function LocationEditModal({
  isOpen,
  onClose,
  onConfirm,
  locationType,
  locationAddress,
}: LocationEditModalProps) {
  const isOrigin = locationType === "origin";
  const title = isOrigin ? "ویرایش مبدا" : "ویرایش مقصد";
  const icon = isOrigin
    ? "solar:map-point-bold"
    : "solar:map-point-favourite-bold";
  const iconColor = isOrigin ? "text-blue-500" : "text-green-500";
  const message = isOrigin
    ? "آیا می‌خواهید مبدا انتخاب شده را ویرایش کنید؟"
    : "آیا می‌خواهید مقصد انتخاب شده را ویرایش کنید؟";

  return (
    <Modal
      backdrop="blur"
      classNames={{
        backdrop: "bg-black/50 backdrop-blur-sm",
        base: "border-none shadow-2xl",
        header: "border-b border-gray-100",
        footer: "border-t border-gray-100",
      }}
      isOpen={isOpen}
      placement="center"
      onClose={onClose}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center`}
            >
              <Icon icon={"hugeicons:pin-location-02"} width={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          </div>
        </ModalHeader>
        <ModalBody className="py-6">
          <div className="space-y-4">
            <p className="text-sm text-gray-700 leading-relaxed text-right">
              {message}
            </p>
            {locationAddress && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs text-gray-500 mb-2">
                  {isOrigin ? "مبدا فعلی:" : "مقصد فعلی:"}
                </p>
                <p className="text-sm text-gray-800 font-medium leading-relaxed text-right">
                  {locationAddress}
                </p>
              </div>
            )}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
              <Icon
                className="text-amber-600 mt-0.5 flex-shrink-0"
                icon="solar:info-circle-bold"
                width={18}
              />
              <p className="text-xs text-amber-800 leading-relaxed text-right">
                با تایید، نقشه باز می‌شود و می‌توانید موقعیت جدید را انتخاب کنید
              </p>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="gap-2 flex justify-between">
          <Button
            className="font-medium"
            color="default"
            variant="flat"
            onPress={onClose}
          >
            انصراف
          </Button>
          <Button
            className="font-medium"
            color={"primary"}
            startContent={<Icon icon="solar:pen-bold" width={18} />}
            onPress={() => {
              onConfirm();
              onClose();
            }}
          >
            ویرایش موقعیت
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
