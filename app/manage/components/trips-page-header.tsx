"use client";
import React from "react";
import { Card, CardBody, Chip } from "@heroui/react";

export default function TripsPageHeader({ loading, rowsCount, error }) {
  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">مدیریت سفرها</h1>
          <p className="text-default-500 mt-1">مشاهده و مدیریت تمام سفرهای سیستم</p>
        </div>
        <div className="flex items-center gap-3">
          {loading && (
            <div className="flex items-center gap-2 text-primary">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">بارگذاری...</span>
            </div>
          )}
          <Chip color="primary" variant="flat" size="sm">
            {rowsCount} سفر
          </Chip>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-danger-200 bg-danger-50">
          <CardBody className="py-3">
            <div className="flex items-center gap-3 text-danger-600">
              <div className="w-5 h-5 rounded-full bg-danger-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold">!</span>
              </div>
              <div>
                <p className="font-medium">خطا در دریافت اطلاعات</p>
                <p className="text-sm mt-1">
                  {error} {error.includes('Unauthorized') || error.includes('401') ? ' (احتمالا دسترسی سوپرادمین ندارید)' : ''}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}
    </>
  );
}