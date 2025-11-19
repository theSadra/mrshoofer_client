"use client";

import React from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react";

import { useTripContext } from "@/contexts/TripContext";

export function TripSummaryCard() {
  const { tripData, hasOrigin, hasDestination, hasCompleteRoute, clearTrip } =
    useTripContext();

  if (!hasOrigin() && !hasDestination()) {
    return (
      <Card className="border-dashed border-2 border-gray-300">
        <CardBody className="text-center py-8">
          <Icon
            className="text-gray-400 mx-auto mb-4"
            icon="solar:map-point-add-bold-duotone"
            width={48}
          />
          <p className="text-gray-600 mb-2">هنوز مسیری انتخاب نشده</p>
          <p className="text-sm text-gray-400">
            ابتدا مبدا و مقصد خود را تعیین کنید
          </p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="border border-primary-200 bg-gradient-to-br from-primary-50 to-success-50">
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">مسیر انتخابی</h3>
          <Button
            color="danger"
            size="sm"
            startContent={
              <Icon icon="solar:trash-bin-minimalistic-bold" width={16} />
            }
            variant="flat"
            onPress={clearTrip}
          >
            پاک کردن
          </Button>
        </div>

        {hasOrigin() && (
          <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <Icon
                className="text-white"
                icon="solar:location-bold"
                width={16}
              />
            </div>
            <div>
              <p className="text-xs text-gray-600">مبدا</p>
              <p className="font-medium">
                {tripData.origin?.name || tripData.origin?.address}
              </p>
            </div>
          </div>
        )}

        {hasDestination() && (
          <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
            <div className="w-8 h-8 bg-success-500 rounded-full flex items-center justify-center">
              <Icon className="text-white" icon="solar:flag-bold" width={16} />
            </div>
            <div>
              <p className="text-xs text-gray-600">مقصد</p>
              <p className="font-medium">
                {tripData.destination?.name || tripData.destination?.address}
              </p>
            </div>
          </div>
        )}

        {hasCompleteRoute() && (
          <div className="flex items-center justify-between p-3 bg-success-100 rounded-lg">
            <div className="flex items-center gap-2">
              <Icon
                className="text-success-600"
                icon="solar:check-circle-bold"
                width={20}
              />
              <span className="text-success-700 font-medium">
                مسیر کامل است
              </span>
            </div>
            <Button color="success" size="sm" variant="flat">
              درخواست سفر
            </Button>
          </div>
        )}

        {tripData.estimatedDistance && (
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center">
              <p className="text-xs text-gray-600">مسافت</p>
              <p className="font-bold">{tripData.estimatedDistance} کیلومتر</p>
            </div>
            {tripData.estimatedDuration && (
              <div className="text-center">
                <p className="text-xs text-gray-600">زمان</p>
                <p className="font-bold">{tripData.estimatedDuration} دقیقه</p>
              </div>
            )}
            {tripData.estimatedPrice && (
              <div className="text-center">
                <p className="text-xs text-gray-600">قیمت</p>
                <p className="font-bold">
                  {tripData.estimatedPrice.toLocaleString("fa-IR")} تومان
                </p>
              </div>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
