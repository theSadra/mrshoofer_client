"use client";

import React from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Button,
} from "@heroui/react";
import { Icon } from "@iconify/react";

export default function LocationNoteModal({
  open,
  onClose,
  description,
}: {
  open: boolean;
  onClose: () => void;
  description?: string;
}) {
  return (
    <Modal
      dir="rtl"
      isOpen={open}
      onOpenChange={(isOpen) => (!isOpen ? onClose() : undefined)}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Icon className="text-default-600" icon="mdi:text" width={18} />
          توضیح مبدا
        </ModalHeader>
        <ModalBody>
          {description ? (
            <div className="whitespace-pre-wrap text-default-700 leading-6 text-sm">
              {description}
            </div>
          ) : (
            <div className="text-default-500 text-sm">توضیحی ثبت نشده است.</div>
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
