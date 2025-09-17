"use client";

import React, { useState, useCallback } from "react";
import { Icon } from "@iconify/react";
import { Chip, Button } from "@heroui/react";

import AssignDriverModal from "./AssignDriverModal";

// Minimal Trip type for placeholder rendering
interface Trip {
  id: string;
  Driver?: any;
  [key: string]: any;
}

const columns = [
  { name: " ", uid: "Status", sortable: true },
  { name: "اولویت", uid: "Priority", sortable: true },
  { name: "مسیر و حرکت", uid: "Direction", sortable: true },
  { name: "خودرو", uid: "Detail", sortable: true },
  { name: "راننده", uid: "Driver", sortable: true },
];

export default function TripsTable() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [assignModalOpen, setAssignModalOpen] = useState<boolean>(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

  const renderCell = useCallback((trip: Trip, columnKey: string) => {
    switch (columnKey) {
      case "Status":
        return (
          <Chip color="warning" size="sm" variant="flat">
            Pending
          </Chip>
        );
      case "Priority":
        return <span className="text-xs text-default-500">-</span>;
      case "Direction":
        return (
          <div className="flex items-center justify-center gap-1 text-xs">
            <Icon
              className="text-primary"
              icon="solar:map-point-bold"
              width={16}
            />
            <span>{String(trip.pickup ?? "-")}</span>
            <Icon
              className="mx-1 text-default-400"
              icon="solar:arrow-right-linear"
              width={14}
            />
            <Icon
              className="text-success"
              icon="solar:map-arrow-right-bold"
              width={16}
            />
            <span>{String(trip.dropoff ?? "-")}</span>
          </div>
        );
      case "Detail":
        return <span className="text-xs">-</span>;
      case "Driver":
        return (
          <Button
            color="primary"
            size="sm"
            onPress={() => {
              setSelectedTripId(trip.id);
              setAssignModalOpen(true);
            }}
          >
            Assign
          </Button>
        );
      default:
        return <>{String(trip[columnKey] ?? "")}</>;
    }
  }, []);

  return (
    <div className="p-3">
      <div className="text-sm text-default-500 mb-2">
        Legacy table placeholder. Prefer the new /manage/upcomings page.
      </div>
      <div className="rounded-xl border border-default-200 bg-white shadow-sm overflow-x-auto">
        {loading ? (
          <div className="py-6 text-center text-default-500">Loading...</div>
        ) : trips.length === 0 ? (
          <div className="py-6 text-center text-default-500">
            No trips to show.
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-default-50">
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.uid}
                    className="px-3 py-2 font-semibold text-default-700 text-center"
                  >
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trips.map((trip, idx) => (
                <tr
                  key={trip.id ?? idx}
                  className={idx % 2 === 0 ? "bg-white" : "bg-default-50"}
                >
                  {columns.map((c) => (
                    <td
                      key={c.uid}
                      className="px-2 py-2 text-center align-middle"
                    >
                      {renderCell(trip, c.uid)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AssignDriverModal
        open={assignModalOpen}
        tripId={selectedTripId ?? ""}
        onAssigned={() => setAssignModalOpen(false)}
        onClose={() => setAssignModalOpen(false)}
      />
    </div>
  );
}
