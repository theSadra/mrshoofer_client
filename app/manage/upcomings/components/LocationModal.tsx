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

import LocationMap from "./LocationMap";

export type LocationModalProps = {
  open: boolean;
  onClose: () => void;
  lat?: number;
  lng?: number;
  addressText?: string;
  context?: "origin" | "destination";
};

export default function LocationModal({
  open,
  onClose,
  lat,
  lng,
  addressText,
  context = "origin",
}: LocationModalProps) {
  const valid =
    typeof lat === "number" &&
    typeof lng === "number" &&
    !isNaN(lat) &&
    !isNaN(lng);
  const isDestination = context === "destination";
  const modalTitle = isDestination ? "موقعیت مقصد" : "موقعیت مبدا";
  const helperCopy = isDestination
    ? "موقعیت و آدرسی که کاربر به عنوان مقصد انتخاب کرده است"
    : "موقعیتی و آدرسی که کاربر به عنوان مبدا انتخاب کرده است";
  const missingCopy = isDestination
    ? "مختصات مقصد موجود نیست."
    : "مختصات مبدا موجود نیست.";
  const addressLabel = isDestination ? "آدرس مقصد" : "آدرس مبدا";

  return (
    <Modal
      dir="rtl"
      isOpen={open}
      onOpenChange={(isOpen) => (!isOpen ? onClose() : undefined)}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Icon
            className="text-primary"
            icon="qlementine-icons:location-16"
            width={18}
          />

          <span className="font-medium ">{modalTitle}</span>
        </ModalHeader>

        <ModalBody>
          <div className="text-default-600 text-sm font-light">{helperCopy}</div>
          {!valid ? (
            <div className="text-danger text-sm">{missingCopy}</div>
          ) : (
            <div className="flex flex-col gap-3">
              {addressText ? (
                <div className="text-default-700 text-sm inline-flex items-center gap-2">
                  <Icon
                    className="text-primary"
                    icon="solar:map-point-bold"
                    width={18}
                  />
                  <span className="font-medium truncate" title={addressText}>
                    {addressLabel}: {addressText}
                  </span>
                </div>
              ) : null}
              <LocationMap lat={lat!} lng={lng!} />
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            بستن
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
