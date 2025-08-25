import React, { useEffect, useState } from 'react'
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
} from "@heroui/modal";

import { Button } from '@heroui/button';
import { Image } from '@heroui/react';

interface WelcomePassengerModalProps {
    tripId: string;
}

export const WelcomePassengerModal: React.FC<WelcomePassengerModalProps> = ({ tripId }) => {
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
        // Mark this modal as shown for this trip - PERMANENTLY
        const key = `welcome-modal-shown-${tripId}`;
        localStorage.setItem(key, 'true');
        onOpenChange(); // Close the modal
    };

    // Don't render anything if we shouldn't show the modal
    if (!shouldShow) {
        return null;
    }

    return (
        <div>
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                closeButton={false}
                placement="center"
                size='xs'
                backdrop="opaque"
                isDismissable={false}
                hideCloseButton
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalBody className="items-center p-5">


                                <Image
                                    className='align-center pt-2'
                                    alt="TaxiImage"
                                    src="/taxicheck.png"
                                    width={75}
                                />

                                <p className="text-center text-lg font-extrabold mb-0">
                                    سفر جدید برای شما ثبت شد
                                </p>


                                <p className="text-center text-sm leading-relaxed  font-light text-default-700">
                                    راننده گرامی، سفر جدیدی برای شما ثبت شده است و
                                    <span className="font-bold text-default-700 px-1">
                                        اطلاعات مسافر
                                    </span>


                                    و
                                    <span className="font-bold text-default-700 px-1">
                                        مبدا
                                    </span>
                                    ایشان

                                    ، در این صفحه قابل مشاهده می‌باشد.
                                </p>
                                <p>

                                </p>
                                <p className="text-start text-sm leading-relaxed  font-light text-default-700">
                                    <svg xmlns="http://www.w3.org/2000/svg" className='inline me-1' width={18} height={18} viewBox="0 0 48 48"><circle cx={24} cy={24} r={21} fill="#2196f3"></circle><path fill="#fff" d="M22 22h4v11h-4z"></path><circle cx={24} cy={16.5} r={2.5} fill="#fff"></circle></svg>
                                    خواهش‌مند است برای تجربه سفری خوب و ارائه حرفه‌ای خدمات، به‌
                                    <span className="font-bold text-default-700 mx-1">
                                        قوانین سفر
                                    </span>
                                    و
                                    <span className="font-bold text-default-700 px-1">
                                        ‌حضور به موقع‌
                                    </span>
                                    <br></br>
                                    در مکان مبدا برای شروع سفر توجه فرمایید.

                                    <br></br>

                                </p>
                                <Image
                                    src='/mrshoofer_logo_full.png'
                                    width={120}
                                >

                                </Image>

                                <Button color="primary" className='w-full' onPress={handleClose}>
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