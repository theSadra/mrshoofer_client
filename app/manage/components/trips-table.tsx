// @ts-nocheck
"use client";
import React from "react";
import { formatTehranTime, formatTehranDate } from "@/lib/format-date";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardHeader,
  CardBody,
  Chip,
  Button,
  Pagination,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { SearchIcon } from "@heroui/shared-icons";
import { Icon } from "@iconify/react";

/** @typedef {Object} TripRow
 * @property {number} id
 * @property {string} TicketCode
 * @property {string | null} [TripCode]
 * @property {string} OriginCity
 * @property {string} DestinationCity
 * @property {string} StartsAt
 * @property {string} status
 * @property {number | null} [driverId]
 * @property {number | null} [locationId]
 * @property {Object | null} [Passenger]
 * @property {Object | null} [Driver]
 */

/** @typedef {Object} TripsTableProps
 * @property {TripRow[]} rows
 * @property {boolean} loading
 * @property {number} page
 * @property {number} totalPages
 * @property {string} sortBy
 * @property {string} sortOrder
 * @property {number} activeFiltersCount
 * @property {Function} onPageChange
 * @property {Function} onSortChange
 * @property {Function} onClearFilters
 */

/**
 * @param {TripsTableProps} props
 */
export default function TripsTable(/** @type {TripsTableProps} */ props) {
  const {
    rows,
    loading,
    page,
    totalPages,
    sortBy,
    sortOrder,
    activeFiltersCount,
    onPageChange,
    onSortChange,
    onClearFilters,
  } = props;

  // Modal state for driver details
  const {isOpen, onOpen, onOpenChange, onClose} = useDisclosure();
  const [selectedDriver, setSelectedDriver] = React.useState(null);

  /**
   * Open driver modal for given trip row's driver
   * @param {TripRow} trip
   */
  const handleOpenDriver = (trip) => {
    if (trip?.Driver) {
      setSelectedDriver({
        ...trip.Driver,
        id: trip.driverId,
        tripId: trip.id,
      });
      onOpen();
    }
  };

  /**
   * @param {string} field
   */
  const toggleSort = (/** @type {string} */ field) => {
    onSortChange(field);
  };

  return (
    <>
      {/* Enhanced Data Table */}
      <Card className="border-default-200 shadow-md">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">نتایج جستجو</h3>
              <Chip color="default" variant="flat" size="sm">
                صفحه {page} از {totalPages}
              </Chip>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-default-500">
                {rows.length > 0 ? `نمایش ${rows.length} سفر` : 'سفری یافت نشد'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="pt-0">
          <Table 
            aria-label="Trips management table"
            classNames={{
              wrapper: "min-h-[400px]",
              th: "bg-default-50 text-default-700 font-semibold",
              td: "py-4"
            }}
          >
            <TableHeader>
              <TableColumn 
                onClick={() => toggleSort("TicketCode")}
                className="cursor-pointer hover:bg-default-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  کد سفر
                  {sortBy === "TicketCode" && (
                    <span className="text-xs">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </TableColumn>
              <TableColumn>مبدا و مقصد</TableColumn>
              <TableColumn 
                onClick={() => toggleSort("StartsAt")}
                className="cursor-pointer hover:bg-default-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  شروع سفر
                  {sortBy === "StartsAt" && (
                    <span className="text-xs">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </TableColumn>
              <TableColumn>اطلاعات راننده</TableColumn>
              <TableColumn>اطلاعات مسافر</TableColumn>
              
            </TableHeader>
            <TableBody 
              emptyContent={
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-default-100 rounded-full flex items-center justify-center mb-4">
                    <SearchIcon className="w-8 h-8 text-default-400" />
                  </div>
                  <h4 className="text-lg font-medium text-default-600 mb-2">سفری یافت نشد</h4>
                  <p className="text-default-500 mb-4">با فیلترهای انتخابی شما هیچ سفری یافت نشد</p>
                  {activeFiltersCount > 0 && (
                    <Button variant="flat" size="sm" onPress={onClearFilters}>
                      پاک کردن فیلترها
                    </Button>
                  )}
                </div>
              }
            >
              {rows.map((/** @type {TripRow} */ r) => (
                <TableRow key={r.id} className="hover:bg-default-50 transition-colors">
                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <span className="font-mono text-sm font-semibold text-primary">
                        {r.TicketCode}
                      </span>
                      {/* Driver Status Chip */}
                      <div className="flex align-baseline items-center gap-1">

                      <Chip
                        size="sm"
                        color={r.driverId ? "default" : "danger"}
                        variant="bordered"
                        >
                        {r.driverId ? "دارای راننده" : "بدون راننده"}
                      </Chip>
                        </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium ">{r.OriginCity}</span>
                        <span className="text-default-400">

                          <Icon icon="solar:arrow-left-linear" className="w-4 h-4" />
                        </span>
                        <span className="font-medium">{r.DestinationCity}</span>
                      </div>
                      <Chip
                        size="sm"
                        color={r.locationId ? "success" : "warning"}
                        variant="flat"
                      >
                        {r.locationId ? (<><Icon icon="basil:location-check-outline" className="w-4 h-4 inline me-1" /><span>ثبت شده</span></>) 
                        
                        : <>
                          <Icon icon="mynaui:question" className="w-4 h-4 inline me-1" />
                          <span>لوکیشن ندارد</span>
                        </>}
                      </Chip>
                    </div>
                  </TableCell>

                   <TableCell>
                    <div className="flex flex-col gap-1">
                       <span className="text-md font-medium ">
                        {formatTehranTime(r.StartsAt)}
                      </span>
                      <span className="text-sm font-medium text-default-600">
                        {formatTehranDate(r.StartsAt)}
                      </span>
                     
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {r.Driver ? (
                      <Button
                        size="sm"
                        variant="flat"
                        color="secondary"
                        className="font-medium"
                        onPress={() => handleOpenDriver(r)}
                        startContent={<Icon icon="radix-icons:person" className="text-base" />}
                      >
                        {r.Driver.Firstname} {r.Driver.Lastname}
                      </Button>
                    ) : (
                      <span className="font-thin text-default-400">بدون راننده</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">
                        {r.Passenger?.Firstname} {r.Passenger?.Lastname}
                      </span>
                      <span className="text-sm text-default-500">
                        {r.Passenger?.NumberPhone || "شماره تماس ثبت نشده"}
                      </span>
                    </div>
                  </TableCell>
                  

                  

                 
               
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-default-500">
            صفحه {page} از {totalPages} 
            {rows.length > 0 && ` • نمایش ${rows.length} سفر`}
          </div>
          <Pagination 
            page={page} 
            total={totalPages} 
            onChange={onPageChange}
            showControls
            size="sm"
            classNames={{
              wrapper: "gap-0 overflow-visible h-8",
              item: "w-8 h-8 text-small rounded-none bg-transparent",
              cursor: "bg-primary text-white font-medium"
            }}
          />
        </div>
      )}
      {/* Driver Details Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center" backdrop="blur">
        <ModalContent>
          {(close) => (
            <>
              <ModalHeader className="flex flex-col gap-1">اطلاعات راننده</ModalHeader>
              <ModalBody>
                {selectedDriver ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-start gap-3">
                      <span className="text-default-500">نام راننده:</span>
                      <span className="font-medium">{selectedDriver.Firstname} {selectedDriver.Lastname}</span>
                    </div>
                    {selectedDriver.id && (
                      <div className="flex items-center justify-start gap-3">
                        <span className="text-default-500">نام خودرو:</span>
                        <span className="font-mono">{selectedDriver.Car}</span>
                      </div>
                    )}
                    {selectedDriver.NumberPhone && (
                      <div className="flex items-center justify-start gap-3">
                        <span className="text-default-500">شماره تماس:</span>
                        <span className="font-medium ltr:font-mono">{selectedDriver.NumberPhone}</span>
                      </div>
                    )}
                    {selectedDriver.tripId && (
                      <div className="flex items-center justify-between">
                        <span className="text-default-500">Trip ID:</span>
                        <span className="font-mono">{selectedDriver.tripId}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-default-400 text-center py-4">راننده‌ای انتخاب نشده است</div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={close}>بستن</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}