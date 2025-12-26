"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Chip } from "@heroui/react";
import { Spacer, Spinner } from "@heroui/react";
import { Select, SelectItem } from "@heroui/select";
import { Icon } from "@iconify/react";
import persianDate from "persian-date";

import AssignDriverModal from "../(protected)/upcoming/components/AssignDriverModal";

import TripCard, {
  Trip,
  TripStatus,
  TripLocationOpenPayload,
} from "./components/TripCard";
import TripTable from "./components/TripTable";
import LocationModal from "./components/LocationModal";
import CallDriverModal from "./components/CallDriverModal";
import LocationNoteModal from "./components/LocationNoteModal";

// Map prisma TripStatus -> UI status buckets
function mapPrismaStatusToUi(status: string): TripStatus {
  switch (status) {
    case "intrip":
      return "ongoing";
    case "done":
      return "completed";
    case "canceled":
      // treat canceled as completed in this view or exclude via filter later
      return "completed";
    default:
      // wating_info | wating_location | wating_start
      return "pending";
  }
}

function formatDayParam(offset = 0) {
  const d = new Date();

  d.setDate(d.getDate() + offset);
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");

  return `${y}-${m}-${day}`;
}

function formatDateTimeFa(dt: string | Date | undefined) {
  if (!dt) return undefined;
  const date = typeof dt === "string" ? new Date(dt) : dt;

  try {
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

// Ensure Persian locale for persian-date
try {
  (persianDate as any).toLocale("fa");
} catch {}

function formatFaTime(dt: string | Date | undefined) {
  if (!dt) return undefined;
  try {
    const d = typeof dt === "string" ? new Date(dt) : dt;

    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Tehran",
    }).format(d);
  } catch {
    return undefined;
  }
}

function formatFaDate(dt: string | Date | undefined) {
  if (!dt) return undefined;
  try {
    const d = typeof dt === "string" ? new Date(dt) : dt;

    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      dateStyle: "medium",
      timeZone: "Asia/Tehran",
    }).format(d);
  } catch {
    return undefined;
  }
}


export default function UpcomingsPage() {
  type ExtendedTrip = Trip;
  const [trips, setTrips] = useState<ExtendedTrip[]>([]);
  const [assignFilter, setAssignFilter] = useState<
    "all" | "assigned" | "unassigned"
  >("all");
  const MAX_DAYS = 10; // today + tomorrow + day after + 7 more days
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const [counts, setCounts] = useState<{
    total: number;
    visible: number;
    unassigned: number[];
  }>({
    total: 0,
    visible: 0,
    unassigned: Array.from({ length: MAX_DAYS }, () => 0),
  });

  // Persian month/day like "۶/۲۴" based on Persian calendar and Tehran timezone
  function formatFaMonthDay(offset = 0) {
    const d = new Date();

    d.setDate(d.getDate() + offset);
    try {
      const month = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
        month: "numeric",
      }).format(d);
      const day = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
        day: "numeric",
      }).format(d);

      return `${month}/${day}`;
    } catch {
      // fallback numeric
      return `${d.getMonth() + 1}/${d.getDate()}`;
    }
  }
  const [loadingTrips, setLoadingTrips] = useState<boolean>(true);
  const [hasLoadedTrips, setHasLoadedTrips] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [activeTripId, setActiveTripId] = useState<string | number | null>(
    null,
  );
  const [locOpen, setLocOpen] = useState(false);
  const [locLat, setLocLat] = useState<number | undefined>(undefined);
  const [locLng, setLocLng] = useState<number | undefined>(undefined);
  const [locAddress, setLocAddress] = useState<string | undefined>(undefined);
  const [locContext, setLocContext] = useState<TripLocationOpenPayload["context"]>("origin");
  const [callOpen, setCallOpen] = useState(false);
  const [callDriverName, setCallDriverName] = useState<string | undefined>(
    undefined,
  );
  const [callDriverPhone, setCallDriverPhone] = useState<string | undefined>(
    undefined,
  );
  const [descOpen, setDescOpen] = useState(false);
  const [descText, setDescText] = useState<string | undefined>(undefined);
  // Passenger POV link modal state
  const [povOpen, setPovOpen] = useState(false);
  const [povLink, setPovLink] = useState<string | undefined>(undefined);
  const openPov = (token?: string) => {
    if (!token) return;
    const link = `/trip/info/${token}`;
    setPovLink(link);
    setPovOpen(true);
  };

  // Open assign driver modal
  const openAssign = (tripId: string) => {
    setActiveTripId(tripId);
    setAssignModalOpen(true);
  };

  const openLocation = ({
    context,
    lat,
    lng,
    addressText,
  }: TripLocationOpenPayload) => {
    setLocContext(context);
    setLocLat(lat);
    setLocLng(lng);
    setLocAddress(addressText);
    setLocOpen(true);
  };

  const openCall = (driverName?: string, driverPhone?: string) => {
    setCallDriverName(driverName);
    setCallDriverPhone(driverPhone);
    setCallOpen(true);
  };

  const openLocationDesc = (description?: string) => {
    if (!description) return;
    setDescText(description);
    setDescOpen(true);
  };

  const mapTripRecord = (t: any): ExtendedTrip => {
    const startsAtRaw = t?.StartsAt ? new Date(t.StartsAt) : undefined;
    const startsAt =
      startsAtRaw && !isNaN(startsAtRaw.getTime()) ? startsAtRaw : undefined;
    const pickup = t?.OriginCity || t?.Location?.TextAddress || "-";
    const dropoff =
      t?.DestinationCity ||
      t?.DestinationLocation?.TextAddress ||
      t?.Location?.TextAddress ||
      "-";
    const originLat =
      typeof t?.Location?.Latitude === "number"
        ? t.Location.Latitude
        : undefined;
    const originLng =
      typeof t?.Location?.Longitude === "number"
        ? t.Location.Longitude
        : undefined;
    const destinationLat =
      typeof t?.DestinationLocation?.Latitude === "number"
        ? t.DestinationLocation.Latitude
        : undefined;
    const destinationLng =
      typeof t?.DestinationLocation?.Longitude === "number"
        ? t.DestinationLocation.Longitude
        : undefined;
    const hasLocation =
      typeof originLat === "number" && typeof originLng === "number";
    const hasDestinationLocation =
      typeof destinationLat === "number" && typeof destinationLng === "number";
    const scheduledDate = formatFaDate(startsAt);
    const scheduledTime = formatFaTime(startsAt);
    const scheduledAt =
      scheduledDate && scheduledTime
        ? `${scheduledDate} ${scheduledTime}`
        : scheduledDate || scheduledTime;

    return {
      id: String(t.id),
      pickup,
      dropoff,
      scheduledAt,
      scheduledTime,
      scheduledDate,
      status: mapPrismaStatusToUi(t.status),
      assignedDriverId: t.driverId ? String(t.driverId) : null,
      driverName: t.Driver
        ? `${t.Driver.Firstname ?? ""} ${t.Driver.Lastname ?? ""}`.trim()
        : undefined,
      driverCar: t.Driver?.CarName ?? undefined,
      driverPhone: t.Driver?.PhoneNumber ?? undefined,
      tripCarName: t.CarName ?? undefined,
      ticketCode: t.TicketCode ?? undefined,
      secureToken: t.SecureToken ?? undefined,
      hasLocation,
      hasDestinationLocation,
      originLat,
      originLng,
      destinationLat,
      destinationLng,
      originAddress: t.Location?.TextAddress ?? undefined,
      destinationAddress: t.DestinationLocation?.TextAddress ?? undefined,
      originDescription: t.Location?.Description ?? undefined,
      destinationDescription: t.DestinationLocation?.Description ?? undefined,
      startsAtMs: startsAt ? startsAt.getTime() : Number.POSITIVE_INFINITY,
      // Passenger information
      passengerName: t.Passenger
        ? `${t.Passenger.Firstname ?? ""} ${t.Passenger.Lastname ?? ""}`.trim()
        : undefined,
      passengerPhone: t.Passenger?.NumberPhone ?? undefined,
    };
  };

  // Fetch trips when day changes
  useEffect(() => {
    let cancelled = false;

    async function loadTrips() {
      setError(null);
      try {
        setLoadingTrips(true);
        const day = formatDayParam(selectedDayIdx);
        const res = await fetch(`/manage/upcoming/api/upcomings?day=${day}`);

        if (!res.ok) throw new Error("خطا در دریافت سفرها");
        const data: any[] = await res.json();

        if (cancelled) return;
        // Filter out test trips and map the remaining ones
        const filtered = data.filter((t: any) => {
          const originCity = t?.OriginCity || "";
          const destCity = t?.DestinationCity || "";
          const passengerFirstname = t?.Passenger?.Firstname || "";
          const passengerLastname = t?.Passenger?.Lastname || "";
          return !originCity.includes("تست") && 
                 !destCity.includes("تست") && 
                 !passengerFirstname.includes("تست") && 
                 !passengerLastname.includes("تست");
        });
        const mapped: ExtendedTrip[] = filtered.map(mapTripRecord);

        setTrips(mapped);
      } catch (e: any) {
        setError(e?.message || "خطای ناشناخته در دریافت سفرها");
      } finally {
        setLoadingTrips(false);
        setHasLoadedTrips(true);
      }
    }
    loadTrips();

    return () => {
      cancelled = true;
    };
  }, [selectedDayIdx]);

  // Fetch unassigned counts for today/tomorrow/day after
  async function refreshUnassignedCounts() {
    try {
      const days = Array.from({ length: MAX_DAYS }, (_, i) =>
        formatDayParam(i),
      );
      const responses = await Promise.all(
        days.map((day) => fetch(`/manage/upcoming/api/upcomings?day=${day}`)),
      );
      const jsons = await Promise.all(
        responses.map((r) => r.json().catch(() => [])),
      );
      const countsArray = jsons.map((arr: any) =>
        Array.isArray(arr) ? arr.filter((t: any) => !t.driverId).length : 0,
      );

      setCounts((prev) => ({ ...prev, unassigned: countsArray }));
    } catch {
      // quietly ignore counts error
    }
  }

  // Keep counts in sync: total/visible from current trips; unassigned via fetch
  useEffect(() => {
    const filtered =
      assignFilter === "all"
        ? trips
        : assignFilter === "assigned"
          ? trips.filter((t) => !!t.assignedDriverId)
          : trips.filter((t) => !t.assignedDriverId);

    setCounts((prev) => ({
      ...prev,
      total: trips.length,
      visible: filtered.length,
    }));
  }, [trips, assignFilter]);

  useEffect(() => {
    // refresh unassigned counts initially and when day changes or after assignment
    refreshUnassignedCounts();
    // optional: periodic refresh every 2 minutes
    const id = setInterval(refreshUnassignedCounts, 120000);

    return () => clearInterval(id);
  }, [selectedDayIdx]);

  const { displayTrips, groupBreakIndex } = useMemo(() => {
    const sortByStart = (arr: typeof trips) =>
      [...arr].sort((a, b) => {
        const at = a.startsAtMs ?? Number.POSITIVE_INFINITY;
        const bt = b.startsAtMs ?? Number.POSITIVE_INFINITY;

        return at - bt;
      });
    const unassigned = sortByStart(trips.filter((t) => !t.assignedDriverId));
    const assigned = sortByStart(trips.filter((t) => !!t.assignedDriverId));

    if (assignFilter === "all") {
      return {
        displayTrips: [...unassigned, ...assigned],
        groupBreakIndex: unassigned.length,
      };
    }
    if (assignFilter === "unassigned") {
      return { displayTrips: unassigned, groupBreakIndex: undefined };
    }

    return { displayTrips: assigned, groupBreakIndex: undefined };
  }, [trips, assignFilter]);

  const onAssignedRefresh = async () => {
    const day = formatDayParam(selectedDayIdx);
    const tRes = await fetch(`/manage/upcoming/api/upcomings?day=${day}`);

    if (tRes.ok) {
      const data: any[] = await tRes.json();
      // Filter out test trips
      const filtered = data.filter((t: any) => {
        const originCity = t?.OriginCity || "";
        const destCity = t?.DestinationCity || "";
        const passengerFirstname = t?.Passenger?.Firstname || "";
        const passengerLastname = t?.Passenger?.Lastname || "";
        return !originCity.includes("تست") && 
               !destCity.includes("تست") && 
               !passengerFirstname.includes("تست") && 
               !passengerLastname.includes("تست");
      });
      const mapped: ExtendedTrip[] = filtered.map(mapTripRecord);

      setTrips(mapped);
    }
    await refreshUnassignedCounts();
  };

  const getDayLabel = (idx: number) => {
    if (idx === 0) return "امروز";
    if (idx === 1) return "فردا";
    if (idx === 2) return "پس‌فردا";

    return formatFaMonthDay(idx);
  };

  return (
    <div
      className="w-full px-3 py-4"
      dir="rtl"
    >
      <div className="flex flex-col gap-3 mb-3">
        {/* Page title */}
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl font-bold text-default-900">سفرهای پیش‌رو</h1>
        </div>
        {/* <div className="flex items-center justify-between gap-2">
          <h1 className="text-lg font-bold">سفارش‌ها و سفرهای جدید</h1>
          <div className="flex items-center gap-2">
            <Chip size="sm" variant="flat" color="default" title="تعداد کل سفرها">
              {counts.total}
            </Chip>
            <Chip size="sm" variant="flat" color="success" title="تعداد نمایش داده شده">
              {counts.visible}
            </Chip>
          </div>
        </div> */}

        {/* Day chips with unassigned counts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {Array.from({ length: MAX_DAYS }, (_, idx) => idx).map((idx) => (
            <button
              key={idx}
              className={`px-3 py-1.5 rounded-full border text-sm whitespace-nowrap transition ${
                selectedDayIdx === idx
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-default-700 border-default-200 hover:bg-default-100"
              }`}
              onClick={() => setSelectedDayIdx(idx)}
            >
              <span className="ml-2">{getDayLabel(idx)}</span>
              <span className="text-xs opacity-80">
                بدون راننده: {counts.unassigned[idx] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Icon
          className="text-default-500"
          icon="solar:filter-linear"
          width={18}
        />
        <Select
          aria-label="فیلتر بر اساس تخصیص"
          className="shrink-0 w-[220px] sm:w-[260px]"
          selectedKeys={new Set([assignFilter])}
          size="sm"
          onSelectionChange={(keys) => {
            if (keys === "all") return;
            const key = Array.from(keys as Set<string>)[0] as
              | "all"
              | "assigned"
              | "unassigned"
              | undefined;

            setAssignFilter(key ?? "all");
          }}
        >
          <SelectItem key="all" textValue="همه">
            <div className="flex items-center gap-2">
              <Icon
                className="text-default-500"
                icon="heroicons-outline:squares-2x2"
                width={18}
              />
              <span>همه</span>
            </div>
          </SelectItem>
          <SelectItem key="assigned" textValue="تخصیص داده‌شده">
            <div className="flex items-center gap-2">
              <Icon
                className="text-success"
                icon="heroicons-outline:check-circle"
                width={18}
              />
              <span>تخصیص داده‌شده</span>
            </div>
          </SelectItem>
          <SelectItem key="unassigned" textValue="بدون راننده">
            <div className="flex items-center gap-2">
              <Icon
                className="text-danger"
                icon="heroicons-outline:no-symbol"
                width={18}
              />

              <span>بدون راننده</span>
            </div>
          </SelectItem>
        </Select>
      </div>

      {error ? <div className="text-danger text-sm mb-3">{error}</div> : null}

      {loadingTrips || !hasLoadedTrips ? (
        <div className="flex items-center justify-center py-10 text-default-500 gap-2">
          <Spinner size="sm" />
          <span className="text-sm">در حال بارگذاری سفرها...</span>
        </div>
      ) : displayTrips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center text-default-500">
          <Icon
            className="mb-2"
            icon="solar:checklist-minimalistic-linear"
            width={36}
          />
          <div className="text-sm">سفری با این فیلتر یافت نشد</div>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="flex flex-col gap-3 lg:hidden">
            {assignFilter === "all" ? (
              <>
                {displayTrips.slice(0, groupBreakIndex ?? 0).map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onOpenAssignAction={() => openAssign(trip.id)}
                    onOpenCallAction={openCall}
                    onOpenLocationAction={openLocation}
                    onOpenLocationDescAction={openLocationDesc}
                    onOpenPovLinkAction={openPov}
                  />
                ))}
                {/* Separator between unassigned and assigned */}
                {(groupBreakIndex ?? 0) > 0 &&
                (groupBreakIndex ?? 0) < displayTrips.length ? (
                  <div className="border-t border-default-200 my-2" />
                ) : null}
                {displayTrips.slice(groupBreakIndex ?? 0).map((trip) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    onOpenAssignAction={() => openAssign(trip.id)}
                    onOpenCallAction={openCall}
                    onOpenLocationAction={openLocation}
                    onOpenLocationDescAction={openLocationDesc}
                    onOpenPovLinkAction={openPov}
                  />
                ))}
              </>
            ) : (
              displayTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onOpenAssignAction={() => openAssign(trip.id)}
                  onOpenCallAction={openCall}
                  onOpenLocationAction={openLocation}
                  onOpenLocationDescAction={openLocationDesc}
                  onOpenPovLinkAction={openPov}
                />
              ))
            )}
          </div>
          {/* Desktop table */}
          <div className="hidden lg:block">
              <TripTable
                groupBreakIndex={
                  assignFilter === "all" ? groupBreakIndex : undefined
                }
                trips={displayTrips}
                onOpenAssignAction={(id) => openAssign(id)}
                onOpenCallAction={openCall}
                onOpenLocationAction={openLocation}
                onOpenLocationDescAction={openLocationDesc}
                onOpenPovLinkAction={openPov}
              />
          </div>
        </>
      )}
      <Spacer y={8} />
      <LocationModal
        addressText={locAddress}
        context={locContext}
        lat={locLat}
        lng={locLng}
        open={locOpen}
        onClose={() => setLocOpen(false)}
      />
      <CallDriverModal
        driverName={callDriverName}
        driverPhone={callDriverPhone}
        open={callOpen}
        onClose={() => setCallOpen(false)}
      />
      <LocationNoteModal
        description={descText}
        open={descOpen}
        onClose={() => setDescOpen(false)}
      />
      <AssignDriverModal
        open={assignModalOpen}
        tripId={activeTripId ?? ""}
        onAssigned={() => {
          setAssignModalOpen(false);
          setActiveTripId(null);
          onAssignedRefresh();
        }}
        onClose={() => setAssignModalOpen(false)}
      />
      <Modal isOpen={povOpen} onOpenChange={setPovOpen} placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-right">لینک صفحه مسافر</ModalHeader>
              <ModalBody>
                {povLink ? (
                  <div className="flex flex-col gap-3">
                    <Chip variant="flat" color="default" className="justify-center" size="sm">{povLink}</Chip>
                    <Button
                      color="primary"
                      size="sm"
                      variant="flat"
                      onPress={async () => {
                        try {
                          await navigator.clipboard.writeText(window.location.origin + povLink);
                        } catch {}
                      }}
                    >
                      کپی لینک
                    </Button>
                  </div>
                ) : (
                  <div className="text-default-500 text-sm">لینک در دسترس نیست</div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>بستن</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
