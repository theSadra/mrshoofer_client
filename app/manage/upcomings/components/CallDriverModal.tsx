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

export type CallDriverModalProps = {
  open: boolean;
  onClose: () => void;
  driverName?: string;
  driverPhone?: string;
};

export default function CallDriverModal({
  open,
  onClose,
  driverName,
  driverPhone,
}: CallDriverModalProps) {
  const telHref = React.useMemo(() => {
    if (!driverPhone) return undefined;
    // Normalize: remove spaces, dashes, and parentheses
    const cleaned = driverPhone.replace(/[\s\-()]/g, "");

    return `tel:${cleaned}`;
  }, [driverPhone]);

  return (
    <Modal
      dir="rtl"
      isOpen={open}
      placement="center"
      onOpenChange={(isOpen) => (!isOpen ? onClose() : undefined)}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Icon
            className="text-primary"
            icon="heroicons-outline:phone"
            width={18}
          />
          تماس با راننده
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-2 text-default-700">
            {driverName ? (
              <div className="text-sm">
                <span className="text-default-500">راننده: </span>
                <span className="font-medium">{driverName}</span>
              </div>
            ) : null}
            <div className="text-sm">
              <span className="text-default-500">شماره تماس: </span>
              <span className="font-bold text-default-900 ltr:font-mono">
                {driverPhone || "نامشخص"}
              </span>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            بستن
          </Button>
          <Button
            as={telHref ? "a" : undefined}
            color="primary"
            href={telHref}
            isDisabled={!telHref}
            startContent={<Icon icon="heroicons-outline:phone" width={18} />}
          >
            تماس
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
