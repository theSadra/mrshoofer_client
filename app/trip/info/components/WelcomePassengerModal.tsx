import React, { useEffect, useState } from "react";
import { Modal, ModalContent, ModalBody, useDisclosure } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Image } from "@heroui/react";

interface WelcomePassengerModalProps {
  tripId: string;
  showOneTime: boolean;
}

export const WelcomePassengerModal: React.FC<WelcomePassengerModalProps> = ({
  tripId,
  showOneTime,
}) => {
  const [shouldShow, setShouldShow] = useState(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    // Check if this modal has been shown for this trip before
    const key = `welcome-modal-shown-${tripId}`;
    const hasBeenShown = localStorage.getItem(key);

    if (!hasBeenShown) {
      setShouldShow(true);
      onOpen(); // Open the modal
    }
  }, [tripId, onOpen]);

  const handleClose = () => {
    // Only store flag in database if should be shown one time
    if (showOneTime) {
      // Mark this modal as shown for this trip - PERMANENTLY
      const key = `welcome-modal-shown-${tripId}`;

      localStorage.setItem(key, "true");
    }
    onOpenChange(); // Close the modal
  };

  // Don't render anything if we shouldn't show the modal
  // If should be shown onetime and shown once
  if (showOneTime && !shouldShow) {
    return null;
  }

  return (
    <div>
      <Modal
        hideCloseButton
        backdrop="opaque"
        closeButton={false}
        isDismissable={false}
        isOpen={isOpen}
        placement="center"
        size="xs"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalBody className="items-center p-5">
                <Image
                  alt="TaxiImage"
                  className="align-center pt-3"
                  src="/suitcase.png"
                  width={105}
                />

                <p className="text-center text-lg font-bold mb-0">
                  چمدونتو بستی؟
                </p>

                <p
                  className="text-center text-sm leading-relaxed font-light text-default-700"
                  dir="rtl"
                >
                  مسافر عزیز، سفر سواری شما با موفقیت ثبت شده و برای شروع سفر،
                  فقط{" "}
                  <span className="font-bold text-default-700">یک مرحله</span>{" "}
                  باقی مونده
                </p>
                <p />
                <p
                  className="text-center text-sm leading-relaxed font-light text-default-700"
                  dir="rtl"
                >
                  <svg
                    className="inline me-1"
                    height={18}
                    viewBox="0 0 48 48"
                    width={18}
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx={24} cy={24} fill="#2196f3" r={21} />
                    <path d="M22 22h4v11h-4z" fill="#fff" />
                    <circle cx={24} cy={16.5} fill="#fff" r={2.5} />
                  </svg>
                  برای تکمیل مراحل سفر، کافیست مشخصات{" "}
                  <span className="font-bold text-default-700">مبدا</span> را در
                  این صفحه وارد کنید تا راننده در زمان شروع سفرتون، در مبدا شما
                  حاضر باشه
                </p>
                <Image src="/mrshoofer_logo_full.png" width={120} />

                <Button
                  className="w-full"
                  color="primary"
                  onPress={handleClose}
                >
                  متوجه شدم
                </Button>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default WelcomePassengerModal;
