"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@heroui/button";
import { Tabs, Tab, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";

import TripsTable from "./components/table";

const getDayString = (offset: number) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  // Format as yyyy-mm-dd in local time
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function Page() {
  const [selectedTab, setSelectedTab] = useState("today");
  const [tripCounts, setTripCounts] = useState<{ [key: string]: number }>({
    today: 0,
    tomorrow: 0,
    aftertomorrow: 0,
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const tabToOffset = {
    today: 0,
    tomorrow: 1,
    aftertomorrow: 2,
  };

  const fetchCounts = useCallback(async () => {
    const updates: { [key: string]: number } = {};
    for (const key of Object.keys(tabToOffset)) {
      const day = getDayString(tabToOffset[key as keyof typeof tabToOffset]);
      const res = await fetch(`/manage/upcoming/api/upcomings?day=${day}`);
      const trips = await res.json();
      updates[key] = Array.isArray(trips)
        ? trips.filter((t) => !t.Driver).length
        : 0;
    }
    setTripCounts(updates);
  }, []);

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(() => {
      fetchCounts();
      setRefreshKey((k) => k + 1);
    }, 2 * 60 * 1000); // 2 minutes
    return () => clearInterval(interval);
  }, [fetchCounts]);

  const selectedDay =
    getDayString(tabToOffset[selectedTab as keyof typeof tabToOffset] || 0);

  return (
    <div className="min-h-screen flex flex-col">
      <h1 className="text-3xl font-bold leading-9 text-default-foreground inline ms-2 md:ms-0 mb-2">
        سفرهای پیش‌رو
      </h1>

      <div className="mt-2">
        <h2 className="mt-2 text-small text-default-500">
          در این قسمت های پیش‌رو بر اساس زمان شروع، قابل مشاهده است.
        </h2>

        <div className="flex-col justify-between align-super mt-3">
          <Tabs
            className=""
            aria-label="Tabs variants"
            variant="solid"
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key as string)}
          >
            <Tab
              key="today"
              title={
                <div className="flex items-center">
                  <span>امروز</span>
                  {tripCounts.today > 0 && (
                    <Chip
                      size="sm"
                      className="ms-1"
                      color="danger"
                      variant="flat"
                    >
                      {tripCounts.today}
                    </Chip>
                  )}
                </div>
              }
            />
            <Tab
              key="tomorrow"
              title={
                <div className="flex items-center">
                  <span>فردا</span>
                  {tripCounts.tomorrow > 0 && (
                    <Chip
                      size="sm"
                      className="ms-1"
                      color="danger"
                      variant="flat"
                    >
                      {tripCounts.tomorrow}
                    </Chip>
                  )}
                </div>
              }
            />
            <Tab
              key="aftertomorrow"
              title={
                <div className="flex items-center">
                  <span>پس‌فردا</span>
                  {tripCounts.aftertomorrow > 0 && (
                    <Chip
                      size="sm"
                      className="ms-1"
                      color="danger"
                      variant="flat"
                    >
                      {tripCounts.aftertomorrow}
                    </Chip>
                  )}
                </div>
              }
            />
          </Tabs>
        </div>
        <Button size="sm" className="bg-default-100 text-sm font-light mt-3">
          <Icon
            width={22}
            icon={"solar:calendar-line-duotone"}
            className="text-default-700"
          ></Icon>
          انتخاب تاریخ
        </Button>
      </div>

      <div className="flex-1">
        <TripsTable day={selectedDay} onTripsChanged={fetchCounts} refreshKey={refreshKey} />
      </div>
    </div>
  );
}

export default Page;
