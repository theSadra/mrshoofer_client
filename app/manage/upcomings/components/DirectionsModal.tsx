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

export type DirectionsModalProps = {
  open: boolean;
  onClose: () => void;
  pickup?: string;
  dropoff?: string;
};

export default function DirectionsModal({
  open,
  onClose,
  pickup,
  dropoff,
}: DirectionsModalProps) {
  const origin = pickup?.trim() || "";
  const destination = dropoff?.trim() || "";

  const googleUrl = React.useMemo(() => {
    const base = "https://www.google.com/maps/dir/?api=1";
    const params = new URLSearchParams();

    if (origin) params.set("origin", origin);
    if (destination) params.set("destination", destination);
    params.set("travelmode", "driving");

    return `${base}&${params.toString()}`;
  }, [origin, destination]);

  // Neshan web deep link. If textual origin/destination don't resolve automatically,
  // users can still open and select points. This is the best-effort public route URL.
  const neshanUrl = React.useMemo(() => {
    // Known public web pattern
    const base = "https://neshan.org/route";
    const params = new URLSearchParams();

    if (origin) params.set("origin", origin);
    if (destination) params.set("destination", destination);

    return `${base}?${params.toString()}`;
  }, [origin, destination]);

  return (
    <Modal
      dir="rtl"
      isOpen={open}
      onOpenChange={(isOpen) => (!isOpen ? onClose() : undefined)}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">مسیر در نقشه</ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-2 text-default-700 text-sm">
            <div className="flex items-center gap-2">
              <Icon
                className="text-primary"
                icon="solar:map-point-bold"
                width={18}
              />
              <span className="font-medium truncate" title={origin}>
                {origin || "مبدا نامشخص"}
              </span>
              <Icon
                className="text-default-500"
                icon="solar:arrow-left-linear"
                width={16}
              />
              <span className="font-medium truncate" title={destination}>
                {destination || "مقصد نامشخص"}
              </span>
            </div>

            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                className="flex items-center justify-center gap-2 rounded-lg border border-default-200 px-3 py-2 hover:bg-default-50 transition"
                href={googleUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <Icon icon="logos:google-maps" width={22} />
                <span className="font-medium">باز کردن در گوگل‌مپ</span>
              </a>

              <a
                className="flex items-center justify-center gap-2 rounded-lg border border-default-200 px-3 py-2 hover:bg-default-50 transition"
                href={neshanUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <img
                  alt="Neshan"
                  className="h-5 w-auto"
                  src="/neshanlogo.png"
                />
                <span className="font-medium">باز کردن در نشان</span>
              </a>
            </div>

            <p className="text-xs text-default-500 leading-5">
              توجه: لینک‌های بالا بر اساس آدرس‌های متنی ساخته شده‌اند. در صورت
              نیاز ممکن است لازم باشد نقطه دقیق را روی نقشه انتخاب کنید.
            </p>
          </div>
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
