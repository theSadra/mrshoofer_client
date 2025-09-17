import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

interface LocationUpdatedModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LocationUpdatedModal({
  isOpen,
  onOpenChange,
}: LocationUpdatedModalProps) {
  return (
    <Modal
      backdrop="opaque"
      hideCloseButton={false}
      isDismissable={true}
      isKeyboardDismissDisabled={false}
      isOpen={isOpen}
      placement="center"
      size="xs"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-2 mt-2 text-center pb-2">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      clipRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      fillRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-lg font-bold text-default-700 text-center tracking-tight">
                مبدا بروز رسانی شد!
              </h2>
            </ModalHeader>
            <ModalBody className="text-center pb-2">
              <div className="space-y-1">
                <p className="text-gray-800 text-sm leading-relaxed font-normal">
                  اطلاعات موقعیت شما با موفقیت به‌روزرسانی شد و تغییرات ذخیره
                  گردید.
                </p>
              </div>
            </ModalBody>
            <ModalFooter className="justify-center pt-2">
              <Button
                className="shadow-md w-100 mt-2 transition-all duration-300  rounded-xl"
                color="primary"
                size="md"
                variant="solid"
                onPress={onClose}
              >
                باشه
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
