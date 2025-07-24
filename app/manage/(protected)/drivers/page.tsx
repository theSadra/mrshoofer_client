"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import DriverTable, { Driver } from "./DriverTable";
import EditDriverModal from "./EditDriverModal";

const AddDriverModal = dynamic(() => import("../upcoming/components/AddDriverModal"), { ssr: false });

export default function DriversPage() {
    const [addOpen, setAddOpen] = useState(false);
    const [editDriver, setEditDriver] = useState<Driver | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleDriverAdded = () => {
        setAddOpen(false);
        setRefreshKey((k) => k + 1);
    };

    const handleDriverUpdated = () => {
        setEditDriver(null);
        setRefreshKey((k) => k + 1);
    };

    return (
        <div className="min-h-screen flex flex-col p-6">
            <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
                <Icon icon="fluent-color:people-team-16" width={32} className="text-primary" />
                مدیریت رانندگان
            </h1>
            <p className="mb-6 text-default-500">در این صفحه می‌توانید رانندگان را مشاهده و مدیریت کنید.</p>
            {/* Top controls: search bar and add button on one line */}
            <div className="flex justify-end mb-4">
                <Button color="primary" onClick={() => setAddOpen(true)} startContent={<Icon icon="fluent-color:add-circle-20" width={22} />}>
                    افزودن راننده جدید
                </Button>
            </div>
            <DriverTable key={refreshKey} onEdit={driver => setEditDriver(driver)} />
            <AddDriverModal open={addOpen} onClose={() => setAddOpen(false)} onDriverAdded={handleDriverAdded} />
            <EditDriverModal
                open={!!editDriver}
                driverId={editDriver ? Number(editDriver.id) : null}
                onClose={() => setEditDriver(null)}
                onDriverUpdated={handleDriverUpdated}
            />
            <Link href="/manage/upcoming" className="text-primary underline mt-8">
                بازگشت به سفرهای پیش‌رو
            </Link>
        </div>
    );
}

// This page should be protected, so move to (protected)/drivers/page.tsx
