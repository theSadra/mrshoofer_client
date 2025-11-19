"use client";
import React from "react";

import TripsPageHeader from "../../../manage/components/trips-page-header";
import TripsFilterBar from "../../../manage/components/trips-filter-bar";
import TripsTable from "../../../manage/components/trips-table";

/** @typedef {Object} TripRow
 * @property {number} id
 * @property {string} TicketCode
 * @property {string | null | undefined} [TripCode]
 * @property {string} OriginCity
 * @property {string} DestinationCity
 * @property {string} StartsAt
 * @property {string} status
 * @property {number | null | undefined} [driverId]
 * @property {number | null | undefined} [locationId]
 * @property {{ Firstname: string; Lastname: string; NumberPhone?: string | null } | null | undefined} [Passenger]
 * @property {{ Firstname: string; Lastname: string } | null | undefined} [Driver]
 */

export default function SuperadminTripsPage() {
  // Local UI state for filters/search/pagination; wired to API
  const [search, setSearch] = React.useState("");
  const [driverFilter, setDriverFilter] = React.useState("all");
  const [locationFilter, setLocationFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [page, setPage] = React.useState(1);
  const [sortBy, setSortBy] = React.useState("StartsAt");
  const [sortOrder, setSortOrder] = React.useState("desc");
  // Store Persian date objects from react-multi-date-picker
  const [dateFrom, setDateFrom] = React.useState(null);
  const [dateTo, setDateTo] = React.useState(null);
  const [showFilters, setShowFilters] = React.useState(true);

  /** @type {[TripRow[], Function]} */
  // @ts-ignore - using JSDoc typing
  const [rows, setRows] = React.useState([]);
  const [totalPages, setTotalPages] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "100",
        search,
        driver: driverFilter,
        location: locationFilter,
        status: statusFilter,
        sortBy,
        sortOrder,
      });

      if (dateFrom) {
        // Convert Persian DateObject to Gregorian for API
        const gregorianDate = dateFrom.toDate();

        params.set("dateFrom", gregorianDate.toISOString());
      }
      if (dateTo) {
        // Convert Persian DateObject to Gregorian for API
        const gregorianDate = dateTo.toDate();

        params.set("dateTo", gregorianDate.toISOString());
      }
      try {
        const res = await fetch(`/api/superadmin/trips?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!res.ok) {
          // Attempt to parse error json
          let msg = `Request failed (${res.status})`;

          try {
            const j = await res.json();

            if (j?.error) msg = j.error;
          } catch {}
          throw new Error(msg);
        }
        const json = await res.json();

        if (json.error) throw new Error(json.error);
        setRows(json.data || []);
        setTotalPages(json.totalPages || 1);
      } catch (e) {
        if (e.name === "AbortError") return;
        setError(e.message || "خطا در دریافت داده");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    run();

    return () => controller.abort();
  }, [
    page,
    search,
    driverFilter,
    locationFilter,
    statusFilter,
    sortBy,
    sortOrder,
    dateFrom,
    dateTo,
  ]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Helper function to clear all filters
  const clearAllFilters = () => {
    setSearch("");
    setDriverFilter("all");
    setLocationFilter("all");
    setStatusFilter("all");
    setDateFrom(null);
    setDateTo(null);
    setPage(1);
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
    <div className="space-y-6">
      {/* Header Section */}
      <TripsPageHeader
        error={error}
        loading={loading}
        rowsCount={rows.length}
      />

      {/* Filter Navigation Bar */}
      <TripsFilterBar
        dateFrom={dateFrom}
        dateTo={dateTo}
        driverFilter={driverFilter}
        locationFilter={locationFilter}
        search={search}
        sortBy={sortBy}
        sortOrder={sortOrder}
        statusFilter={statusFilter}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onDriverFilterChange={setDriverFilter}
        onLocationFilterChange={setLocationFilter}
        onPageChange={setPage}
        onSearchChange={setSearch}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Trips Table */}
      <TripsTable
        activeFiltersCount={activeFiltersCount}
        loading={loading}
        page={page}
        rows={rows}
        sortBy={sortBy}
        sortOrder={sortOrder}
        totalPages={totalPages}
        onClearFilters={clearAllFilters}
        onPageChange={setPage}
        onSortChange={toggleSort}
      />
    </div>
  );
}
