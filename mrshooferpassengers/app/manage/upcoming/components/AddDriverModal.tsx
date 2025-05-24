"use client";
import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Input, Button, Select, SelectItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { addToast } from "@heroui/toast";
import carnamesRaw from "./carnames.json";

const carnames: string[] = Array.isArray(carnamesRaw) ? carnamesRaw : [];

interface AddDriverModalProps {
    open: boolean;
    onClose: () => void;
    onDriverAdded?: (driver: any) => void;
}

export default function AddDriverModal({ open, onClose, onDriverAdded }: AddDriverModalProps) {
    const [Firstname, setFirstname] = useState("");
    const [Lastname, setLastname] = useState("");
    const [PhoneNumber, setPhoneNumber] = useState("");
    const [CarName, setCarName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/manage/api/drivers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ Firstname, Lastname, PhoneNumber, CarName }),
            });
            let data = null;
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                data = await res.json();
            }
            if (!res.ok) throw new Error((data && data.error) || "خطا در ایجاد راننده جدید");
            if (onDriverAdded) onDriverAdded(data);
            setFirstname("");
            setLastname("");
            setPhoneNumber("");
            setCarName("");
            // Show toast after successful driver creation
            addToast({
                title: "راننده جدید",
                description: "راننده جدید با موفقیت اضافه شد برای ایجاد تغییرات میتوانید در بخش رانندگان این کارو انجام بدید",
                color: "primary",
                variant: "bordered",
            });
            onClose();
        } catch (err: any) {
            setError(err.message || "خطا در ایجاد راننده جدید");
        }
        setLoading(false);
    };

    return (
        <Modal isOpen={open} onClose={onClose} scrollBehavior="inside">
            <ModalContent className="max-w-md w-full">
                <ModalHeader className="flex flex-col gap-2 items-start">
                    <div className="flex items-center gap-2 w-full">
                        <Icon icon="solar:user-plus-rounded-bold-duotone" className="text-primary-500" width={32} />
                        <span className="font-bold text-lg">افزودن راننده جدید</span>
                    </div>
                </ModalHeader>
                <form onSubmit={handleSubmit} className="w-full">
                    <ModalBody className="space-y-3">
                        <Input
                            label="نام راننده"
                            value={Firstname}
                            onChange={e => setFirstname(e.target.value)}
                            required
                            className="w-full"
                        />
                        <Input
                            label="نام خانوادگی راننده"
                            value={Lastname}
                            onChange={e => setLastname(e.target.value)}
                            required
                            className="w-full"
                        />
                        <Input
                            label="شماره تماس"
                            value={PhoneNumber}
                            onChange={e => setPhoneNumber(e.target.value)}
                            required
                            className="w-full"
                            type="tel"
                            pattern="[0-9]+"
                        />
                        {/* CarName as a HeroUI Select dropdown */}
                        <Select
                            label="نام خودرو"
                            placeholder="یک خودرو انتخاب کنید"
                            selectedKeys={CarName ? [CarName] : []}
                            onSelectionChange={keys => {
                                const val = Array.from(keys)[0] as string;
                                setCarName(val);
                            }}
                            required
                            className="w-full"
                        >
                            {carnames.map((name) => (
                                <SelectItem key={name}>{name}</SelectItem>
                            ))}
                        </Select>
                        {error && <div className="text-danger text-sm text-center">{error}</div>}
                    </ModalBody>
                    <ModalFooter className="flex flex-col gap-2 sm:flex-row sm:justify-between">
                        <Button type="button" variant="light" color="danger" onClick={onClose} className="w-full sm:w-auto">بستن</Button>
                        <Button type="submit" color="primary" isLoading={loading} className="w-full sm:w-auto">افزودن راننده</Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    );
}
