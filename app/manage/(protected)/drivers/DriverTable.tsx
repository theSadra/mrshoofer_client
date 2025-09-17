"use client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Spinner,
  Input,
} from "@heroui/react";
import { Icon } from "@iconify/react";

export interface Driver {
  id: string;
  Firstname: string;
  Lastname: string;
  PhoneNumber: string;
  CarName: string;
}

interface DriverTableProps {
  onEdit: (driver: Driver) => void;
  hideSearchBar?: boolean;
}

export default function DriverTable({
  onEdit,
  hideSearchBar = false,
}: DriverTableProps) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const PAGE_SIZE = 10;

  // Fetch drivers from server with search
  const fetchDrivers = async (pageNum = 1, searchValue = "") => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: String(PAGE_SIZE),
      });

      if (searchValue.trim()) params.append("search", searchValue.trim());
      const res = await fetch(`/manage/api/drivers?${params.toString()}`);

      if (!res.ok) throw new Error("خطا در دریافت رانندگان");
      const data = await res.json();

      if (pageNum === 1) setDrivers(data);
      else setDrivers((prev) => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
    } catch (err: any) {
      setError(err.message || "خطا در دریافت رانندگان");
    }
    setLoading(false);
  };

  // Debounce search
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchDrivers(1, search);
      setPage(1);
    }, 400);

    return () => clearTimeout(timeout);
  }, [search]);

  // Initial load (no search)
  useEffect(() => {
    fetchDrivers(1, "");
    setPage(1);
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;

    fetchDrivers(nextPage, search);
    setPage(nextPage);
  };

  return (
    <div className="w-full">
      {!hideSearchBar && (
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <Input
            className="max-w-xs w-full sm:w-auto"
            placeholder="جستجو کنید (نام، نام خانوادگی، شماره تماس یا خودرو)"
            startContent={<Icon icon="solar:magnifer-linear" width={20} />}
            value={search}
            variant="bordered"
            onChange={(e) => setSearch(e.target.value)}
          />
          {/* The add button will be placed by the parent, not here */}
        </div>
      )}
      <Table aria-label="جدول رانندگان" className="mb-4 relative">
        <TableHeader>
          <TableColumn>نام و نام خانوادگی</TableColumn>
          <TableColumn>شماره تماس</TableColumn>
          <TableColumn>خودرو</TableColumn>
          <TableColumn>عملیات</TableColumn>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell className="text-center py-12" colSpan={4}>
                <Spinner />
              </TableCell>
            </TableRow>
          ) : drivers.length > 0 ? (
            drivers.map((driver) => (
              <TableRow key={driver.id}>
                <TableCell className="font-semibold flex items-center gap-2">
                  <Icon
                    className="text-zinc-500"
                    height={34}
                    icon="solar:user-circle-bold-duotone"
                    width={34}
                  />
                  {driver.Firstname} {driver.Lastname}
                </TableCell>
                <TableCell className="text-blue-500">
                  {driver.PhoneNumber}
                </TableCell>
                <TableCell className="text-sm ">{driver.CarName}</TableCell>
                <TableCell>
                  <Button
                    color="primary"
                    size="sm"
                    variant="flat"
                    onClick={() => onEdit(driver)}
                  >
                    <Icon
                      className="me-1"
                      icon="solar:pen-new-square-broken"
                      width={18}
                    />
                    ویرایش
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                className="text-center text-default-400 py-8"
                colSpan={4}
              >
                راننده‌ای یافت نشد.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {error && <div className="text-danger text-center my-2">{error}</div>}
      {hasMore && !loading && (
        <div className="flex justify-center">
          <Button variant="bordered" onClick={loadMore}>
            بارگذاری بیشتر
          </Button>
        </div>
      )}
    </div>
  );
}
