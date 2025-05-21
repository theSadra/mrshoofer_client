"use client";

import React from "react";

import Link from "next/link";
import { Button } from "@heroui/button";
import { Tabs, Tab, Chip } from "@heroui/react";

import { Icon } from "@iconify/react";
import { IncomingMessage } from "http";

import TripsTable from "./components/table";

function page() {
  return (
    <>
      <h1 className="text-3xl font-bold leading-9 text-default-foreground inline ms-2 md:ms-0 mb-2">
        سفرهای پیش‌رو
      </h1>

      <div className="mt-2">
        <h2 className="mt-2 text-small text-default-500">
          در این قسمت های پیش‌رو بر اساس زمان شروع، قابل مشاهده است.
        </h2>

        <div className="flex-col justify-between align-super mt-3">
          <Tabs className="" aria-label="Tabs variants" variant="solid">
            <Tab
              key="photos"
              title={
                <div className="flex items-center">
                  <span>امروز</span>
                  <Chip
                    size="sm"
                    className="ms-1"
                    color="danger"
                    variant="flat"
                  >
                    9 سفر
                  </Chip>
                </div>
              }
            />
            <Tab key="music" title="فردا" />

            <Tab key="videos" title="پس‌فردا" />

            <Tab key="music3" title="1/3" />
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

      <TripsTable></TripsTable>
    </>
  );
}

export default page;
