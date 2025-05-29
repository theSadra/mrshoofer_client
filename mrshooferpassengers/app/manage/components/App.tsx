"use client";

import React, { Suspense } from "react";
import {
  Avatar,
  Button,
  Spacer,
  Tab,
  Tabs,
  Tooltip,
  useDisclosure,
  AvatarIcon,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalContent,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useMediaQuery } from "usehooks-ts";
import { usePathname, useSelectedLayoutSegment } from "next/navigation";

import { AcmeLogo } from "./acme";
import ProfileSetting from "./profile-setting";
import AppearanceSetting from "./appearance-setting";
// import AccountSetting from "./account-setting";
import BillingSetting from "./billing-setting";
import TeamSetting from "./team-setting";
import SidebarDrawer from "./sidebar-drawer";
import Sidebar from "./sidebar";
import { cn } from "./cn";
import { Image } from "@heroui/react";
import { items } from "./items";

/**
 * This example requires installing the `usehooks-ts` and `lodash` packages.
 * `npm install usehooks-ts lodash`
 *
 * import {useMediaQuery} from "usehooks-ts";
 * import {isEqual, uniqWith} from "lodash";
 *
 *
 * 💡 TIP: You can use the usePathname hook from Next.js App Router to get the current pathname
 * and use it as the active key for the Sidebar component.
 *
 * ```tsx
 * import {usePathname} from "next/navigation";
 *
 * const pathname = usePathname();
 * const currentPath = pathname.split("/")?.[1]
 *
 * <Sidebar defaultSelectedKey="home" selectedKeys={[currentPath]} />
 * ```
 */
export default function App({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOpen, onOpenChange } = useDisclosure();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  const onToggle = React.useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const segment = useSelectedLayoutSegment();
  const currentKey = segment || "home";

  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  return (
    <div className="flex h-dvh w-full gap-4 border rounded-2xl">
      {/* Sidebar */}
      <SidebarDrawer
        className={cn("min-w-[288px] rounded-lg", {
          "min-w-[76px]": isCollapsed,
        })}
        hideCloseButton={true}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        sidebarPlacement="right"
      >
        <div
          className={cn(
            "will-change relative flex h-full w-72 flex-col bg-[#F1F5F9] p-6 transition-width text-gray-900", // compromise: slightly darker but still light
            {
              "w-[83px] items-center px-[6px] py-6": isCollapsed,
            }
          )}
        >
          <div
            className={cn("flex items-center gap-3 pl-2", {
              "justify-center gap-0 pl-0": isCollapsed,
            })}
          >
            <div className="flex items-center justify-center rounded-2xl py-1">
              <Image
                src="/mrshoofer_logo_full.png"
                alt="Logo"
                height={60}
                width={1050}
                className="object-contain" // or object-scale-down
              />
            </div>
            <span
              className={cn(
                "w-full text-small font-bold uppercase opacity-100",
                {
                  "w-0 opacity-0": isCollapsed,
                }
              )}
            ></span>
            <div className={cn("flex-end flex", { hidden: isCollapsed })}>
              <Icon
                className="cursor-pointer dark:text-primary-foreground/60 [&>g]:stroke-[1px]"
                icon="solar:round-alt-arrow-left-line-duotone"
                width={24}
                onClick={isMobile ? onOpenChange : onToggle}
              />
            </div>
          </div>
          <Spacer y={1} />
          <div className="flex items-center gap-3 px-3">
            <Avatar
              classNames={{
                base: "bg-gradient-to-br from-[pink] to-[#FF705B]",
                icon: "text-black/80",
              }}
              icon={<AvatarIcon />}
            />
            <div
              className={cn("flex max-w-full flex-col", {
                hidden: isCollapsed,
              })}
            >
              <p className="text-small font-medium text-foreground">
                کاربر مدیر
              </p>
              <p className="text-tiny font-medium text-default-400">
                هماهنگی و لجستیک
              </p>
            </div>
          </div>

          <Spacer y={6} />

          <Sidebar
            defaultSelectedKey={currentKey}
            selectedKeys={[currentKey]}
            iconClassName="group-data-[selected=true]:text-default-50"
            isCompact={isCollapsed}
            itemClasses={{
              base: "px-3 rounded-large data-[selected=true]:!bg-foreground",
              title: "group-data-[selected=true]:text-default-50",
            }}
            items={items}
          />

          <Spacer y={8} />

          <div
            className={cn("mt-auto flex flex-col", {
              "items-center": isCollapsed,
            })}
          >
            {isCollapsed && (
              <Button
                isIconOnly
                className="flex h-10 w-10 text-default-600"
                size="sm"
                variant="light"
              >
                <Icon
                  className="cursor-pointer dark:text-primary-foreground/60 [&>g]:stroke-[1px]"
                  height={24}
                  icon="solar:round-alt-arrow-right-line-duotone"
                  width={24}
                  onClick={onToggle}
                />
              </Button>
            )}
            <Tooltip
              content="Support"
              isDisabled={!isCollapsed}
              placement="right"
            >
              <Button
                fullWidth
                className={cn(
                  "justify-start truncate text-default-600 data-[hover=true]:text-foreground",
                  {
                    "justify-center": isCollapsed,
                  }
                )}
                isIconOnly={isCollapsed}
                startContent={
                  isCollapsed ? null : (
                    <Icon
                      className="flex-none text-green-500"
                      icon="solar:info-circle-line-duotone"
                      width={24}
                    />
                  )
                }
                variant="light"
              >
                {isCollapsed ? (
                  <Icon
                    className="text-blue-500"
                    icon="solar:info-circle-line-duotone"
                    width={24}
                  />
                ) : (
                  "پشتیبانی"
                )}
              </Button>
            </Tooltip>
            <Tooltip content="خروج" isDisabled={!isCollapsed} placement="right">
              <Button
                className={cn(
                  "justify-start text-danger-500 data-[hover=true]:text-danger-600",
                  {
                    "justify-center": isCollapsed,
                  }
                )}
                isIconOnly={isCollapsed}
                startContent={
                  isCollapsed ? null : (
                    <Icon
                      className="flex-none rotate-180 text-danger-500"
                      icon="solar:minus-circle-line-duotone"
                      width={24}
                    />
                  )
                }
                onClick={() => setShowLogoutModal(true)}
                variant="light"
              >
                {isCollapsed ? (
                  <Icon
                    className="rotate-180 text-danger-500"
                    icon="solar:minus-circle-line-duotone"
                    width={24}
                  />
                ) : (
                  "خروج"
                )}
              </Button>
            </Tooltip>
            <Modal isOpen={showLogoutModal} onOpenChange={setShowLogoutModal} hideCloseButton>
              <ModalContent>
                {(onClose) => (
                  <>
                    <ModalHeader>تایید خروج</ModalHeader>
                    <ModalBody>
                      <div className="text-center text-lg text-default-700 py-2">آیا مطمئن هستید که می‌خواهید خارج شوید؟</div>
                    </ModalBody>
                    <ModalFooter>
                      <Button color="default" variant="light" onClick={onClose}>
                        انصراف
                      </Button>
                      <Button color="danger" onClick={async () => {
                        const { signOut } = await import("next-auth/react");
                        signOut({ callbackUrl: "/manage/login" });
                        onClose();
                      }}>
                        خروج
                      </Button>
                    </ModalFooter>
                  </>
                )}
              </ModalContent>
            </Modal>
          </div>
        </div>
      </SidebarDrawer>
      {/*  Settings Content */}
      <div className="overflow-auto  flex-1 p-4 mt-5">
        {/* Title */}
        <div className="inline-flex items-center gap-x-3">
          <Button
            isIconOnly
            className="sm:hidden"
            size="sm"
            variant="flat"
            onPress={onOpenChange}
          >
            <Icon
              className="text-default-500"
              icon="solar:sidebar-minimalistic-linear"
              width={20}
            />
          </Button>
          {/* Render the page title here */}
        </div>

        {/*  Tabs */}
        {/* <Tabs
          fullWidth
          classNames={{
            base: "mt-6",
            cursor: "bg-content1 dark:bg-content1",
            panel: "w-full overflow-auto p-0 pt-4",
          }}
        >
          <Tab key="profile" title="Profile">
            <ProfileSetting />
          </Tab>
          <Tab key="appearance" title="Appearance">
            <AppearanceSetting />
          </Tab>
          <Tab key="account" title="Account">
            <AccountSetting />
          </Tab>
          <Tab key="billing" title="Billing">
            <BillingSetting />
          </Tab>
          <Tab key="team" title="Team">
            <TeamSetting />
          </Tab>
        </Tabs> */}

        {children}
      </div>
    </div>
  );
}
