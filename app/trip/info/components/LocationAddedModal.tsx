import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@heroui/react";

interface LocationAddedModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LocationAddedModal({
  isOpen,
  onOpenChange,
}: LocationAddedModalProps) {
  return (
    <Modal
      backdrop="opaque"
      classNames={
        {
          // backdrop: "backdrop-blur-md bg-black/50",
        }
      }
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
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center animate-pulse">
                  <svg
                    className="w-10 h-10 text-white"
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
              <h2 className="text-lg font-bold text-green-700 text-center tracking-tight">
                مبدا دریافت شد!
              </h2>
            </ModalHeader>
            <ModalBody className="text-center pb-2">
              <div className="space-y-1">
                <p className="text-gray-800 text-sm leading-relaxed font-normal">
                  موقعیت مبدا شما را با موفقیت دریافت کردیم!
                </p>
              </div>
              <p className="text-gray-700 text-xs font-light">
                در صورت نیاز به اصلاح آن، می‌توانید از گزینه تغییر موقعیت در
                صفحه اطلاعات سفر، استفاده کنید
              </p>
            </ModalBody>
            <ModalFooter className="justify-center pt-2 ">
              <Button
                className="shadow-md w-100 mt-2 transition-all duration-300  rounded-xl"
                color="primary"
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
