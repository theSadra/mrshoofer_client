"use client";

import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";

interface SuccessLocationModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  message?: string;
  confirmText?: string;
  onConfirm?: () => void;
}

export default function SuccessLocationModal({
  isOpen = false,
  onClose,
  onOpenChange,
  title = "موقعیت با موفقیت ثبت شد",
  message = "اطلاعات موقعیت شما با موفقیت در سیستم ثبت گردید.",
  confirmText = "تایید",
  onConfirm,
}: SuccessLocationModalProps) {
  const {
    isOpen: modalIsOpen,
    onOpen,
    onOpenChange: modalOnOpenChange,
  } = useDisclosure();

  // Use external isOpen if provided, otherwise use internal state
  const modalOpen = isOpen !== undefined ? isOpen : modalIsOpen;
  const handleOpenChange = onOpenChange || modalOnOpenChange;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    if (onClose) {
      onClose();
    } else {
      handleOpenChange(false);
    }
  };

  return (
    <Modal
      backdrop="blur"
      classNames={{
        backdrop: "backdrop-blur-md bg-black/50",
        wrapper: "z-[9999]",
        base: "mx-4",
      }}
      hideCloseButton={false}
      isDismissable={true}
      isKeyboardDismissDisabled={false}
      isOpen={modalOpen}
      placement="center"
      onOpenChange={handleOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-xl">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      clipRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      fillRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-800 text-center">
                {title}
              </h2>
            </ModalHeader>

            <ModalBody className="text-center pb-6">
              <p className="text-gray-600 text-base leading-relaxed">
                {message}
              </p>
            </ModalBody>

            <ModalFooter className="justify-center">
              <Button
                className="px-8 py-2 font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300"
                radius="lg"
                size="lg"
                style={{
                  background:
                    "linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)",
                }}
                variant="solid"
                onPress={handleConfirm}
              >
                {confirmText}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

// Export a hook for easy usage
export const useSuccessLocationModal = () => {
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();

  return {
    isOpen,
    onOpen,
    onClose,
    onOpenChange,
    SuccessModal: (
      props: Omit<SuccessLocationModalProps, "isOpen" | "onOpenChange">,
    ) => (
      <SuccessLocationModal
        {...props}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      />
    ),
  };
};
