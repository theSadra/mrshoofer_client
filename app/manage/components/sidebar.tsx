// app/components/Sidebar.tsx
"use client";

export type SidebarItem = {
  key: string;
  href?: string;
  icon?: string;
  title: string;
  endContent?: React.ReactNode;
  startContent?: React.ReactNode;
  items?: SidebarItem[];
  type?: "nest";
};

import React from "react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  Accordion,
  AccordionItem,
  type ListboxProps,
  type ListboxSectionProps,
  type Selection,
  Listbox,
  Tooltip,
  ListboxItem,
  ListboxSection,
} from "@heroui/react";
import { Icon } from "@iconify/react";

import { cn } from "./cn";

export type SidebarProps = Omit<ListboxProps<SidebarItem>, "children"> & {
  items: SidebarItem[];
  isCompact?: boolean;
  hideEndContent?: boolean;
  iconClassName?: string;
  sectionClasses?: ListboxSectionProps["classNames"];
  classNames?: ListboxProps["classNames"];
  defaultSelectedKey: string;
  onSelect?: (key: string) => void;
};

const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  (
    {
      items,
      isCompact,
      defaultSelectedKey,
      onSelect,
      hideEndContent,
      sectionClasses: sectionClassesProp = {},
      itemClasses: itemClassesProp = {},
      iconClassName,
      classNames,
      className,
      ...props
    },
    ref,
  ) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [selected, setSelected] =
      React.useState<React.Key>(defaultSelectedKey);

    // Build map of key -> href for navigation
    const keyHrefMap = React.useMemo(() => {
      const map = new Map<string, string>();

      function walk(list: SidebarItem[]) {
        for (const it of list) {
          if (it.href) map.set(it.key, it.href);
          if (it.items) walk(it.items);
        }
      }
      walk(items);

      return map;
    }, [items]);

    const sectionClasses = {
      ...sectionClassesProp,
      base: cn(sectionClassesProp.base, "w-full", {
        "p-0 max-w-[44px]": isCompact,
      }),
      group: cn(sectionClassesProp.group, { "flex flex-col gap-1": isCompact }),
      heading: cn(sectionClassesProp.heading, { hidden: isCompact }),
    };

    const itemClasses = {
      ...itemClassesProp,
      base: cn(itemClassesProp.base, { "w-11 h-11 gap-0 p-0": isCompact }),
    };

    const renderNestItem = React.useCallback(
      (item: SidebarItem) => {
        const isNestType = item.items?.length && item.type === "nest";

        return (
          <ListboxItem
            {...item}
            key={item.key}
            classNames={{
              base: cn(
                { "h-auto p-0": !isCompact && isNestType },
                { "inline-block w-11": isCompact && isNestType },
              ),
            }}
            endContent={
              isCompact || isNestType || hideEndContent
                ? null
                : item.endContent || null
            }
            startContent={
              isCompact || isNestType ? null : item.icon ? (
                <Icon
                  className={cn(
                    "text-default-500 group-data-[selected=true]:text-foreground",
                    iconClassName,
                  )}
                  icon={item.icon}
                  width={24}
                />
              ) : (
                item.startContent || null
              )
            }
            title={isCompact || isNestType ? null : item.title}
          >
            {isCompact ? (
              <Tooltip content={item.title} placement="right">
                <div className="flex w-full items-center justify-center">
                  {item.icon ? (
                    <Icon
                      className={cn(
                        "text-default-500 group-data-[selected=true]:text-foreground",
                        iconClassName,
                      )}
                      icon={item.icon}
                      width={24}
                    />
                  ) : (
                    item.startContent || null
                  )}
                </div>
              </Tooltip>
            ) : null}
            {!isCompact && isNestType && (
              <Accordion className="p-0">
                <AccordionItem
                  key={item.key}
                  aria-label={item.title}
                  classNames={{
                    heading: "pr-3",
                    trigger: "p-0",
                    content: "py-0 pl-4",
                  }}
                  title={
                    item.icon ? (
                      <div className="flex h-11 items-center gap-2 px-2 py-1.5">
                        <Icon
                          className={cn(
                            "text-default-500 group-data-[selected=true]:text-foreground",
                            iconClassName,
                          )}
                          icon={item.icon}
                          width={24}
                        />
                        <span className="text-small font-medium text-default-500 group-data-[selected=true]:text-foreground">
                          {item.title}
                        </span>
                      </div>
                    ) : (
                      item.startContent || null
                    )
                  }
                >
                  {item.items?.length ? (
                    <Listbox
                      className="mt-0.5"
                      classNames={{
                        list: cn("border-l border-default-200 pl-4"),
                      }}
                      items={item.items}
                      variant="flat"
                    >
                      {item.items.map(renderItem)}
                    </Listbox>
                  ) : (
                    renderItem(item)
                  )}
                </AccordionItem>
              </Accordion>
            )}
          </ListboxItem>
        );
      },
      [hideEndContent, iconClassName, isCompact],
    );

    const renderItem = React.useCallback(
      (item: SidebarItem) => {
        const isNestType = item.items?.length && item.type === "nest";

        if (isNestType) return renderNestItem(item);

        return (
          <ListboxItem
            {...item}
            key={item.key}
            endContent={
              isCompact || hideEndContent ? null : item.endContent || null
            }
            startContent={
              isCompact ? null : item.icon ? (
                <Icon
                  className={cn(
                    "text-default-500 group-data-[selected=true]:text-foreground",
                    iconClassName,
                  )}
                  icon={item.icon}
                  width={24}
                />
              ) : (
                item.startContent || null
              )
            }
            textValue={item.title}
            title={isCompact ? null : item.title}
          >
            {isCompact ? (
              <Tooltip content={item.title} placement="right">
                <div className="flex w-full items-center justify-center">
                  {item.icon ? (
                    <Icon
                      className={cn(
                        "text-default-500 group-data-[selected=true]:text-foreground",
                        iconClassName,
                      )}
                      icon={item.icon}
                      width={24}
                    />
                  ) : (
                    item.startContent || null
                  )}
                </div>
              </Tooltip>
            ) : null}
          </ListboxItem>
        );
      },
      [hideEndContent, iconClassName, isCompact],
    );

    return (
      <nav className="relative">
        {isPending && (
          <div className="absolute top-2 right-2">
            {/* You can replace this with any spinner component */}
            <span className="animate-spin">⏳</span>
          </div>
        )}
        <Listbox
          key={isCompact ? "compact" : "default"}
          ref={ref}
          hideSelectedIcon
          as="div"
          className={cn("list-none", className)}
          classNames={{
            ...classNames,
            list: cn("items-center", classNames?.list),
          }}
          color="default"
          itemClasses={{
            ...itemClasses,
            base: cn(
              "px-3 min-h-11 rounded-large h-[44px] data-[selected=true]:bg-default-100",
              itemClasses.base,
            ),
            title: cn(
              "text-small font-medium text-default-500 group-data-[selected=true]:text-foreground",
              itemClasses.title,
            ),
          }}
          items={items}
          selectedKeys={[selected] as unknown as Selection}
          selectionMode="single"
          variant="flat"
          onSelectionChange={(keys) => {
            const key = Array.from(keys)[0] as string;
            const href = keyHrefMap.get(key);

            if (!href || key === selected) return;
            // 1) immediately update URL
            router.replace(href);
            // 2) update highlight
            setSelected(key);
            onSelect?.(key);
            // 3) background fetch
            startTransition(() => router.refresh());
          }}
          {...props}
        >
          {(item) =>
            item.items && item.items.length && item.type === "nest" ? (
              renderNestItem(item)
            ) : item.items && item.items.length ? (
              <ListboxSection
                key={item.key}
                classNames={sectionClasses}
                showDivider={isCompact}
                title={item.title}
              >
                {item.items.map(renderItem)}
              </ListboxSection>
            ) : (
              renderItem(item)
            )
          }
        </Listbox>
      </nav>
    );
  },
);

Sidebar.displayName = "Sidebar";

export default Sidebar;
