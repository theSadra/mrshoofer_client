"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@heroui/button";
import { Tabs, Tab, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import dynamic from "next/dynamic";
import PersianDate from "persian-date";

import { DayPicker, getDateLib } from "react-day-picker/persian";
import "react-day-picker/dist/style.css";

import TripsTable from "./components/table";
import type { Key } from "react";

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
  const [selectedDayC, setSelectedDayC] = React.useState(null);

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

  const minSelectableDate = new Date();
  minSelectableDate.setHours(0, 0, 0, 0); // Ensure time is at midnight for accurate comparison
  const [selected, setSelected] = useState<Date>();
  const [showPicker, setShowPicker] = useState(false);
  const [animatePicker, setAnimatePicker] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Animate popup on open/close and handle mount/unmount
  useEffect(() => {
    if (showPicker) {
      setIsMounted(true);
      const t = setTimeout(() => setAnimatePicker(true), 10);
      return () => clearTimeout(t);
    } else if (isMounted) {
      setAnimatePicker(false);
      // Wait for animation to finish before unmounting
      const t = setTimeout(() => setIsMounted(false), 200);
      return () => clearTimeout(t);
    }
  }, [showPicker]);

  // Close popup on outside click
  useEffect(() => {
    if (!showPicker) return;
    function handleClick(e: MouseEvent) {
      const btn = buttonRef.current;
      const popup = popupRef.current;
      if (
        popup && !popup.contains(e.target as Node) &&
        btn && !btn.contains(e.target as Node)
      ) {
        setShowPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showPicker]);

  // If a custom date is selected, use it for filtering
  const selectedDay = selected
    ? (() => {
        const d = new Date(selected);
        d.setHours(0, 0, 0, 0);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      })()
    : getDayString(tabToOffset[selectedTab as keyof typeof tabToOffset] || 0);

  // When a tab is selected, clear the custom date selection
  const handleTabChange = (key: Key | null) => {
    if (!key || typeof key !== "string") return;
    setSelectedTab(key);
    setSelected(undefined);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <h1 className="text-3xl font-bold leading-9 text-default-foreground inline ms-2 md:ms-0 mb-2">
        سفرهای پیش‌رو
      </h1>

      <div className="mt-2">
        <h2 className="mt-2 text-small text-default-500">
          در این قسمت های پیش‌رو بر اساس زمان شروع، قابل مشاهده است.
        </h2>

        <div className="flex justify-start gap-3 align-super mt-3">
          <Tabs
            className=""
            aria-label="Tabs variants"
            variant="solid"
            selectedKey={selectedTab}
            onSelectionChange={handleTabChange}
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
          <div className="flex justify-start items-center gap-4">
            <Button
              ref={buttonRef}
              startContent={<Icon icon="solar:calendar-line-duotone" width={22} />}
              onClick={() => setShowPicker((v) => !v)}
              color={selected ? "primary" : "default"}
              variant="solid"
            >
              {selected ? new PersianDate(selected).format("dddd DD MMMM YYYY") : "انتخاب تاریخ"}
            </Button>
            {isMounted && (
              <div
                ref={popupRef}
                className={`absolute z-50 mt-20 bg-default-100 rounded-2xl shadow-lg border p-4 transition duration-200 ease-out transform
                ${animatePicker ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                style={{ minWidth: 320 }}
              >
                <DayPicker
                  mode="single"
                  selected={selected}
                  onSelect={(date) => {
                    if (!date) return;
                    setSelected(date);
                    setShowPicker(false);
                    // When a custom date is picked, always set selectedTab to null so Tabs is not forced to a value
                    setSelectedTab("");
                  }}
                  fromDate={minSelectableDate}
                />
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="flex-1">
        <TripsTable day={selectedDay} onTripsChanged={fetchCounts} refreshKey={refreshKey} />
      </div>
    </div>
  );
}

export default Page;
