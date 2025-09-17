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
};

export default function LocationModal({
  open,
  onClose,
  lat,
  lng,
  addressText,
}: LocationModalProps) {
  const valid =
    typeof lat === "number" &&
    typeof lng === "number" &&
    !isNaN(lat) &&
    !isNaN(lng);

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

          <span className="font-medium ">موقعیت مبدا</span>
        </ModalHeader>

        <ModalBody>
          <div className="text-default-600 text-sm font-light">
            موقعیتی و آدرسی که کاربر به عنوان مبدا انتخاب کرده است
          </div>
          {!valid ? (
            <div className="text-danger text-sm">مختصات مبدا موجود نیست.</div>
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
                    {addressText}
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
