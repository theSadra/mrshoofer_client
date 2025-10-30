"use client";
import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Select,
  SelectItem,
  Button,
  Badge,
  Chip,
  Divider,
} from "@heroui/react";
import { SearchIcon } from "@heroui/shared-icons";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

/** @typedef {Object} FilterBarProps
 * @property {string} search
 * @property {Function} onSearchChange
 * @property {string} driverFilter
 * @property {Function} onDriverFilterChange
 * @property {string} locationFilter
 * @property {Function} onLocationFilterChange
 * @property {string} statusFilter
 * @property {Function} onStatusFilterChange
 * @property {any} dateFrom
 * @property {Function} onDateFromChange
 * @property {any} dateTo
 * @property {Function} onDateToChange
 * @property {string} sortBy
 * @property {Function} onSortByChange
 * @property {string} sortOrder
 * @property {Function} onSortOrderChange
 * @property {Function} onPageChange
 */

export default function TripsFilterBar({
  search,
  onSearchChange,
  driverFilter,
  onDriverFilterChange,
  locationFilter,
  onLocationFilterChange,
  statusFilter,
  onStatusFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onPageChange,
}) {
  const [showFilters, setShowFilters] = React.useState(true);

  // Helper function to clear all filters
  const clearAllFilters = () => {
    onSearchChange("");
    onDriverFilterChange("all");
    onLocationFilterChange("all");
    onStatusFilterChange("all");
    onDateFromChange(null);
    onDateToChange(null);
    onPageChange(1);
  };

  // Count active filters
  const getActiveFiltersCount = () => {
    let count = 0;
    if (search) count++;
    if (driverFilter !== "all") count++;
    if (locationFilter !== "all") count++;
    if (statusFilter !== "all") count++;
    if (dateFrom) count++;
    if (dateTo) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="border-default-200 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full rtl">
          <div className="flex items-center gap-3 justify-end">
            <h3 className="text-lg font-semibold text-foreground text-right">فیلترها و جستجو</h3>
            {activeFiltersCount > 0 && (
              <Badge color="primary" content={activeFiltersCount} size="sm">
                <Chip color="primary" variant="flat" size="sm">
                  فیلتر فعال
                </Chip>
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 justify-start">
            <Button
              variant="ghost"
              size="sm"
              onPress={() => setShowFilters(!showFilters)}
              className="text-default-600"
            >
              {showFilters ? "مخفی کردن فیلترها" : "نمایش فیلترها"}
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="flat"
                size="sm"
                color="warning"
                onPress={clearAllFilters}
              >
                پاک کردن همه
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardBody className={`transition-all duration-300 ${showFilters ? 'pt-0' : 'hidden'}`}>
        {/* Primary Search Bar */}
        <div className="mb-6">
          <Input
            placeholder="جستجو در کد بلیط، نام مسافر، راننده یا شهر..."
            value={search}
            onValueChange={(v) => {
              onPageChange(1);
              onSearchChange(v);
            }}
            startContent={<SearchIcon className="text-default-400" />}
            isClearable
            size="md"
            className="max-w-xl"
            classNames={{
              input: "text-base",
              inputWrapper: "bg-default-100 border-2 border-transparent hover:border-primary-200 focus-within:border-primary data-[hover=true]:bg-default-200/50"
            }}
          />
        </div>

        <Divider className="my-4" />

        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 rtl">
          {/* Driver Filter */}
          <div className="space-y-2 text-right">
            <label className="block text-sm font-medium text-default-700 text-right">وضعیت راننده</label>
            <Select
              placeholder="انتخاب راننده"
              selectedKeys={[driverFilter]}
              onChange={(e) => {
                onPageChange(1);
                onDriverFilterChange(e.target.value);
              }}
              size="sm"
              classNames={{
                trigger: "bg-default-100 border-1 border-default-300 hover:border-primary-300"
              }}
            >
              <SelectItem key="all">همه رانندگان</SelectItem>
              <SelectItem key="assigned">راننده دارد</SelectItem>
              <SelectItem key="unassigned">بدون راننده</SelectItem>
            </Select>
          </div>

          {/* Location Filter */}
          <div className="space-y-2 text-right">
            <label className="block text-sm font-medium text-default-700 text-right">وضعیت آدرس</label>
            <Select
              placeholder="انتخاب آدرس"
              selectedKeys={[locationFilter]}
              onChange={(e) => {
                onPageChange(1);
                onLocationFilterChange(e.target.value);
              }}
              size="sm"
              classNames={{
                trigger: "bg-default-100 border-1 border-default-300 hover:border-primary-300"
              }}
            >
              <SelectItem key="all">همه آدرس‌ها</SelectItem>
              <SelectItem key="assigned">آدرس ثبت شده</SelectItem>
              <SelectItem key="unassigned">بدون آدرس</SelectItem>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2 text-right">
            <label className="block text-sm font-medium text-default-700 text-right">وضعیت سفر</label>
            <Select
              placeholder="انتخاب وضعیت"
              selectedKeys={[statusFilter]}
              onChange={(e) => {
                onPageChange(1);
                onStatusFilterChange(e.target.value);
              }}
              size="sm"
              classNames={{
                trigger: "bg-default-100 border-1 border-default-300 hover:border-primary-300"
              }}
            >
              <SelectItem key="all">همه وضعیت‌ها</SelectItem>
              <SelectItem key="pending">در انتظار</SelectItem>
              <SelectItem key="confirmed">تأیید شده</SelectItem>
              <SelectItem key="in_progress">در حال انجام</SelectItem>
              <SelectItem key="completed">تکمیل شده</SelectItem>
              <SelectItem key="cancelled">لغو شده</SelectItem>
            </Select>
          </div>

          {/* Sort Options */}
          <div className="space-y-2 text-right">
            <label className="block text-sm font-medium text-default-700 text-right">مرتب‌سازی</label>
            <Select
              placeholder="انتخاب مرتب‌سازی"
              selectedKeys={[`${sortBy}-${sortOrder}`]}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                onSortByChange(field);
                onSortOrderChange(order);
              }}
              size="sm"
              classNames={{
                trigger: "bg-default-100 border-1 border-default-300 hover:border-primary-300"
              }}
            >
              <SelectItem key="StartsAt-desc">جدیدترین سفر</SelectItem>
              <SelectItem key="StartsAt-asc">قدیمی‌ترین سفر</SelectItem>
              <SelectItem key="TicketCode-asc">کد بلیط (الف-ی)</SelectItem>
              <SelectItem key="TicketCode-desc">کد بلیط (ی-الف)</SelectItem>
            </Select>
          </div>

          {/* Date From */}
          <div className="space-y-2 text-right">
            <label className="block text-sm font-medium text-default-700 text-right">از تاریخ</label>
            <div className="relative">
              <DatePicker
                value={dateFrom}
                onChange={(date) => {
                  onPageChange(1);
                  onDateFromChange(date);
                }}
                calendar={persian}
                locale={persian_fa}
                placeholder="انتخاب تاریخ شروع"
                className="rmdp-input px-3 py-2 rounded-lg border border-default-300 text-sm w-full focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 bg-default-100"
                containerClassName="w-full"
                calendarPosition="bottom-right"
              />
            </div>
          </div>

          {/* Date To */}
          <div className="space-y-2 text-right">
            <label className="block text-sm font-medium text-default-700 text-right">تا تاریخ</label>
            <div className="relative">
              <DatePicker
                value={dateTo}
                onChange={(date) => {
                  onPageChange(1);
                  onDateToChange(date);
                }}
                calendar={persian}
                locale={persian_fa}
                placeholder="انتخاب تاریخ پایان"
                className="rmdp-input px-3 py-2 rounded-lg border border-default-300 text-sm w-full focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 bg-default-100"
                containerClassName="w-full"
                calendarPosition="bottom-right"
              />
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="mt-4 pt-4 border-t border-default-200 rtl">
            <div className="flex flex-wrap gap-2 justify-start items-center">
              <span className="text-sm font-medium text-default-600 ml-2">فیلترهای فعال:</span>
              {search && (
                <Chip size="sm" color="primary" variant="flat" onClose={() => onSearchChange("")}>
                  جستجو: {search}
                </Chip>
              )}
              {driverFilter !== "all" && (
                <Chip size="sm" color="secondary" variant="flat" onClose={() => onDriverFilterChange("all")}>
                  راننده: {driverFilter === "assigned" ? "دارد" : "ندارد"}
                </Chip>
              )}
              {locationFilter !== "all" && (
                <Chip size="sm" color="success" variant="flat" onClose={() => onLocationFilterChange("all")}>
                  آدرس: {locationFilter === "assigned" ? "دارد" : "ندارد"}
                </Chip>
              )}
              {statusFilter !== "all" && (
                <Chip size="sm" color="warning" variant="flat" onClose={() => onStatusFilterChange("all")}>
                  وضعیت: {statusFilter}
                </Chip>
              )}
              {dateFrom && (
                <Chip size="sm" color="danger" variant="flat" onClose={() => onDateFromChange(null)}>
                  از: {dateFrom.format("YYYY/MM/DD")}
                </Chip>
              )}
              {dateTo && (
                <Chip size="sm" color="danger" variant="flat" onClose={() => onDateToChange(null)}>
                  تا: {dateTo.format("YYYY/MM/DD")}
                </Chip>
              )}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}