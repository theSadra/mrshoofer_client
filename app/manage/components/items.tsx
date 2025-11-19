"use client";
import { Chip } from "@heroui/react";
import React from "react";
import { useSession } from "next-auth/react";
import { type SidebarItem } from "./sidebar";

/**
 * Please check the https://nextui.org/docs/guide/routing to have a seamless router integration
 */

export const baseItems: SidebarItem[] = [
  {
    key: "home",
    href: "/manage/home",
    icon: "solar:home-2-linear",
    title: "خانه",
  },

  {
    key: "upcoming",
    href: "/manage/upcomings",
    icon: "solar:checklist-minimalistic-outline",
    title: "سفرها",
  },
  {
    key: "drivers",
    href: "/manage/drivers",
    icon: "solar:users-group-two-rounded-outline",
    title: "رانندگان",
  },
  {
    key: "tracker",
    href: "#",
    icon: "solar:sort-by-time-linear",
    title: "ردیابی سفر",
    endContent: (
      <Chip size="sm" variant="flat">
        به زودی
      </Chip>
    ),
  },
  {
    key: "analytics",
    href: "#",
    icon: "solar:chart-outline",
    title: "آمار و گزارش",
    endContent: (
      <Chip size="sm" variant="flat">
        به زودی
      </Chip>
    ),
  },
  {
    key: "expenses",
    href: "#",
    icon: "solar:bill-list-outline",
    title: "صورت مالی",
    endContent: (
      <Chip size="sm" variant="flat">
        به زودی
      </Chip>
    ),
  },
];

// Hook to get final items depending on role
export function useManageSidebarItems(): SidebarItem[] {
  const { data: session } = useSession();
  const isSuper = Boolean((session?.user as any)?.isSuperAdmin);
  return React.useMemo(() => {
    if (!isSuper) return baseItems;
    return [
      ...baseItems,
      {
        key: "superadmin-trips",
        href: "/superadmin/trips",
        icon: "solar:shield-check-outline",
        title: "سوپر ادمین: همه سفرها",
      },
    ];
  }, [isSuper]);
}
