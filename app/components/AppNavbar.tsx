"use client";

import React from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@heroui/navbar";
import NextLink from "next/link";

// Use your logo instead of AcmeIcon
import Image from "next/image";

const menuItems = [
  "درباره ما",
  "وبلاگ",
  "مشتریان",
  "قیمت گذاری",
  "شرکت ها",
  "تغییرات",
  "مستندات",
  "تماس با ما",
];

export default function AppNavbar(props: React.ComponentProps<typeof Navbar>) {
  return (
    <Navbar
      {...props}
      classNames={{
        base: "py-4 backdrop-filter-none bg-transparent",
        wrapper: "px-0 w-full justify-center bg-transparent",
        item: "hidden md:flex",
      }}
      height="54px"
    >
      <NavbarContent
        className="gap-4 min-w-80 rounded-full border-small border-default-200/20 bg-background/60 px-2 shadow-medium backdrop-blur-md backdrop-saturate-150 dark:bg-default-100/50"
        justify="center"
      >
        {/* Toggle */}

        {/* Logo */}
        <NavbarBrand className="mr-2 w-[40vw] md:w-auto md:max-w-fit">
          <div className="rounded-fullp-1">
            <Image
              alt="MrShoofer Logo"
              height={70}
              src="/mrshoofer_logo_full.png"
              unoptimized={true}
              width={120}
            />
          </div>
        </NavbarBrand>

        {/* Items */}
        <NavbarItem className="hidden md:flex">
          <NextLink
            className="text-default-500"
            href="/"
            style={{ fontSize: "0.875rem" }}
          >
            خانه
          </NextLink>
        </NavbarItem>
        <NavbarItem>
          <NextLink
            className="text-default-500"
            href="/trip/info"
            style={{ fontSize: "0.875rem" }}
          >
            سفرها
          </NextLink>
        </NavbarItem>
        <NavbarItem isActive>
          <NextLink
            aria-current="page"
            className="text-default-500"
            href="/driver/trip"
            style={{ fontSize: "0.875rem" }}
          >
            رانندگان
          </NextLink>
        </NavbarItem>
        <NavbarItem>
          <NextLink
            className="text-default-500"
            href="/about"
            style={{ fontSize: "0.875rem" }}
          >
            درباره ما
          </NextLink>
        </NavbarItem>
        <NavbarItem>
          <NextLink
            className="text-default-500"
            href="/pricing"
            style={{ fontSize: "0.875rem" }}
          >
            قیمت گذاری
          </NextLink>
        </NavbarItem>
        <NavbarItem className="ml-2 !flex" />

        <NavbarMenuToggle className="ml-3 text-default-400 md:hidden" />
      </NavbarContent>

      {/* Menu */}
      <NavbarMenu
        className="top-[calc(var(--navbar-height)/2)] mx-auto mt-16 max-h-[40vh] max-w-[80vw] rounded-large border-small border-default-200/20 bg-background/60 py-6 shadow-medium backdrop-blur-md backdrop-saturate-150 dark:bg-default-100/50"
        motionProps={{
          initial: { opacity: 0, y: -20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 },
          transition: {
            ease: "easeInOut",
            duration: 0.2,
          },
        }}
      >
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <NextLink
              className="w-full text-default-500"
              href="#"
              style={{ fontSize: "1rem" }}
            >
              {item}
            </NextLink>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </Navbar>
  );
}
