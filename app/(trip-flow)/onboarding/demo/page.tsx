"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

export default function OnboardingDemo() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-8">
          <Icon
            className="text-primary-600 mx-auto mb-4"
            height={64}
            icon="solar:rocket-bold-duotone"
            width={64}
          />
          <h1 className="text-3xl font-bold text-default-900 mb-4">
            تست صفحه خوش‌آمدگویی
          </h1>
          <p className="text-default-600 mb-8">
            برای مشاهده انیمیشن‌های زیبا و تجربه کاربری فوق‌العاده، وارد صفحه
            خوش‌آمدگویی شوید.
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/onboarding">
            <Button
              className="w-full"
              color="primary"
              endContent={<Icon icon="solar:arrow-left-linear" width={20} />}
              size="lg"
            >
              شروع خوش‌آمدگویی
            </Button>
          </Link>

          <Link href="/">
            <Button
              className="w-full"
              color="default"
              size="lg"
              variant="bordered"
            >
              بازگشت به صفحه اصلی
            </Button>
          </Link>
        </div>

        <div className="mt-12 p-6 bg-default-50 rounded-xl border border-default-200">
          <h2 className="text-lg font-semibold text-default-900 mb-3">
            ویژگی‌های پیاده‌سازی شده:
          </h2>
          <div className="space-y-2 text-sm text-default-600 text-right">
            <div className="flex items-center gap-2">
              <Icon
                className="text-success-500"
                icon="solar:check-circle-bold"
                width={16}
              />
              <span>انیمیشن‌های Framer Motion</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon
                className="text-success-500"
                icon="solar:check-circle-bold"
                width={16}
              />
              <span>طراحی ریسپانسیو و موبایل فرندلی</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon
                className="text-success-500"
                icon="solar:check-circle-bold"
                width={16}
              />
              <span>Progress Dots انیمیت شده</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon
                className="text-success-500"
                icon="solar:check-circle-bold"
                width={16}
              />
              <span>مرحله‌های جداگانه و ماژولار</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon
                className="text-success-500"
                icon="solar:check-circle-bold"
                width={16}
              />
              <span>تنظیمات RTL و فارسی</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon
                className="text-success-500"
                icon="solar:check-circle-bold"
                width={16}
              />
              <span>پس‌زمینه گرادیانت مدرن</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
