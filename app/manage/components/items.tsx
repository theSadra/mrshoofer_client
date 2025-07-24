import { Chip } from "@heroui/react";
import { Icon } from "@iconify/react";

import { type SidebarItem } from "./sidebar";

/**
 * Please check the https://nextui.org/docs/guide/routing to have a seamless router integration
 */

export const items: SidebarItem[] = [
  {
    key: "home",
    href: "/manage",
    icon: "solar:home-2-linear",
    title: "خانه",
  },

  {
    key: "upcoming",
    href: "/manage/upcoming",
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
