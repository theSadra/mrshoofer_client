"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useTripContext } from "../trip-context";

import OnboardingStep1 from "@/components/onboarding/OnboardingStep1";
import OnboardingStep2 from "@/components/onboarding/OnboardingStep2";
import OnboardingStep3 from "@/components/onboarding/OnboardingStep3";
import OnboardingStep4 from "@/components/onboarding/OnboardingStep4";
import ProgressDots from "@/components/onboarding/ProgressDots";
import TripNotFound from "@/components/onboarding/TripNotFound";
import TripLoading from "@/components/onboarding/TripLoading";

const TOTAL_STEPS = 4;

const pageVariants = {
  initial: {
    opacity: 0,
    x: -50,
    scale: 0.96,
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  out: {
    opacity: 0,
    x: 50,
    scale: 1.04,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const stepDetails = [
  {
    title: "شروع سریع سفر",
    description:
      "لطفاً اطلاعات پایه سفر را بررسی کنید تا روند هماهنگی بدون توقف ادامه پیدا کند.",
    highlights: [
      {
        label: "پیشرفت فرم",
        value: "۷۰٪",
        icon: "solar:chart-square-bold-duotone",
        accent: "text-primary-500",
      },
      {
        label: "زمان تخمینی",
        value: "کمتر از ۲ دقیقه",
        icon: "solar:timer-2-bold-duotone",
        accent: "text-secondary-500",
      },
      {
        label: "وضعیت امنیت",
        value: "فعال",
        icon: "solar:shield-broken",
        accent: "text-success-500",
      },
    ],
    tipLabel: "راهنمای سریع",
    tip: "جزئیات سفر را دقیق بنویسید تا پشتیبانی سریع‌تر هماهنگ شود.",
  },
  {
    title: "تعیین مبدا و مقصد",
    description:
      "نقطه شروع و پایان سفر را انتخاب کنید تا مسیر روی نقشه نهایی شود.",
    highlights: [
      {
        label: "مختصات ذخیره‌شده",
        value: "۲",
        icon: "solar:map-point-bold-duotone",
        accent: "text-success-500",
      },
      {
        label: "دقت نقشه",
        value: "۱ متر",
        icon: "solar:target-line-duotone",
        accent: "text-primary-500",
      },
      {
        label: "زمان متوسط",
        value: "۴۵ ثانیه",
        icon: "solar:hourglass-bold-duotone",
        accent: "text-warning-500",
      },
    ],
    tipLabel: "نکته انتخاب",
    tip: "پس از ثبت مبدا، مقصد را در همان نقشه تایید کنید تا خطاها کمتر شود.",
  },
  {
    title: "پیگیری وضعیت سفر",
    description:
      "نمای زنده حرکت راننده و وضعیت مسیر در این مرحله نمایش داده می‌شود.",
    highlights: [
      {
        label: "به‌روزرسانی",
        value: "هر ۸ ثانیه",
        icon: "solar:radar-2-bold",
        accent: "text-primary-500",
      },
      {
        label: "سفرهای ثبت‌شده",
        value: "+۳۵۰۰",
        icon: "solar:road-line-bold",
        accent: "text-secondary-500",
      },
      {
        label: "رضایت کاربران",
        value: "۹۸٪",
        icon: "solar:like-bold",
        accent: "text-success-500",
      },
    ],
    tipLabel: "نکته اعتماد",
    tip: "پیوند ردیابی را با همراهان خود به اشتراک بگذارید.",
  },
  {
    title: "حساب شما فعال شد",
    description: "آخرین بررسی‌ها انجام شده و می‌توانید وارد داشبورد شوید.",
    highlights: [
      {
        label: "پشتیبانی",
        value: "۲۴/۷",
        icon: "solar:lifebuoy-bold",
        accent: "text-warning-500",
      },
      {
        label: "مدارک تایید",
        value: "کامل",
        icon: "solar:check-read-line-duotone",
        accent: "text-success-500",
      },
      {
        label: "پاداش شروع",
        value: "+۱۵٪",
        icon: "solar:gift-bold",
        accent: "text-primary-500",
      },
    ],
    tipLabel: "گام بعدی",
    tip: "با اولین سفر خود پاداش خوش‌آمدگویی دریافت کنید.",
  },
];

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [currentStep, setCurrentStep] = useState(() => {
    const stepParam = Number(searchParams.get("step"));

    if (
      Number.isFinite(stepParam) &&
      stepParam >= 1 &&
      stepParam <= TOTAL_STEPS
    ) {
      return stepParam;
    }

    return 1;
  });
  const {
    setTripToken,
    tripData,
    isLoading,
    error,
    tripToken,
    refreshTripData,
  } = useTripContext();
  const swipeStartRef = useRef<
    { x: number; y: number; time: number; pointerId?: number } | null
  >(null);
  const [hasTripToken, setHasTripToken] = useState(false);
  const refreshTrigger = searchParams.get("refreshTrip");
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Extract triptoken from URL and set it in context
  useEffect(() => {
    const token = searchParams.get("triptoken");

    if (token) {
      setHasTripToken(true);
      // Only set token if it's different or if we don't have trip data yet
      // This prevents re-fetching when coming back from location picker
      if (tripToken !== token) {
        if (typeof setTripToken !== "function") {
          console.error("TripContext setTripToken is not a function", setTripToken);
        } else {
          setTripToken(token);
          console.log("Trip token from URL:", token);
        }
      }
    } else {
      // No token provided
      setHasTripToken(false);
    }
  }, [searchParams, setTripToken, tripToken]);

  useEffect(() => {
    const stepParam = Number(searchParams.get("step"));

    if (
      Number.isFinite(stepParam) &&
      stepParam >= 1 &&
      stepParam <= TOTAL_STEPS &&
      stepParam !== currentStep
    ) {
      setCurrentStep(stepParam);
    }
  }, [searchParams, currentStep]);

  useEffect(() => {
    if (!refreshTrigger) return;

    const runRefresh = async () => {
      await refreshTripData();

      // Clean up URL after refresh
      const params = new URLSearchParams(window.location.search);

      params.delete("refreshTrip");
      const queryString = params.toString();

      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    };

    runRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]); // Only depend on refreshTrigger to prevent infinite loop

  // Ensure the fixed bottom navigation is relative to the real viewport.
  useEffect(() => {
    if (typeof document === "undefined") return;

    const htmlElement = document.documentElement;
    const htmlStyle = htmlElement.style as CSSStyleDeclaration & {
      webkitTransform?: string;
    };
    const previousTransform = htmlStyle.transform;
    const previousWebkitTransform = htmlStyle.webkitTransform;

    htmlStyle.transform = "none";
    htmlStyle.webkitTransform = "none";

    return () => {
      htmlStyle.transform = previousTransform;
      htmlStyle.webkitTransform = previousWebkitTransform ?? "";
    };
  }, []);

  // Retry fetching trip data
  const handleRetry = () => {
    const token = searchParams.get("triptoken");

    if (token) {
      if (typeof setTripToken !== "function") {
        console.error("TripContext setTripToken is not a function on retry", setTripToken);
      } else {
        setTripToken(token);
      }
    }
  };

  const syncStepToUrl = useCallback(
    (stepValue: number) => {
      const params = new URLSearchParams(searchParams.toString());

      params.set("step", stepValue.toString());
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const handleOpenLocationPicker = useCallback(
    (type: "origin" | "destination") => {
      const token =
        tripToken || tripData?.SecureToken || searchParams.get("triptoken");

      if (!token) {
        return;
      }
      const returnParams = new URLSearchParams(searchParams.toString());

      returnParams.set("step", currentStep.toString());
      const encodedReturn = encodeURIComponent(
        `${pathname}?${returnParams.toString()}`,
      );
      const pickerQuery = new URLSearchParams();

      pickerQuery.set("selection", type);
      pickerQuery.set("returnTo", encodedReturn);
      router.push(`/location/${token}?${pickerQuery.toString()}`);
    },
    [tripData, tripToken, searchParams, currentStep, pathname, router],
  );

  // Debug logging
  console.log("Onboarding Debug:", {
    hasTripToken,
    isLoading,
    hasError: !!error,
    error,
    hasTripData: !!tripData,
  });

  // Show loading spinner while fetching trip data
  if (hasTripToken && isLoading) {
    return <TripLoading />;
  }

  // Show TripNotFound page if:
  // 1. No trip token was provided in URL
  // 2. There's an error from the API
  // 3. OR trip token was provided but loading finished and no trip data
  const shouldShowNotFound =
    !hasTripToken ||
    error !== null ||
    (hasTripToken && !isLoading && !tripData);

  if (shouldShowNotFound) {
    console.log("Trip not found - redirecting to dedicated TripNotFound component");
    
    return (
      <TripNotFound
        message={!hasTripToken ? "لینک سفر نامعتبر است" : "سفر یافت نشد"}
        onRetry={handleRetry}
      />
    );
  }

  const nextStep = () => {
    if (currentStep === 2) {
      if (!tripData?.OriginLocation || !tripData?.DestinationLocation) {
        onOpen();

        return;
      }
    }

    if (currentStep < TOTAL_STEPS) {
      const next = currentStep + 1;

      setCurrentStep(next);
      syncStepToUrl(next);
    } else {
      // Navigate to trip info page with secure token
      if (tripData?.SecureToken) {
        router.push(`/trip/info/${tripData.SecureToken}`);
      } else {
        // Fallback to main app if no token
        window.location.href = "/";
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      const prev = currentStep - 1;

      setCurrentStep(prev);
      syncStepToUrl(prev);
    }
  };

  const skipOnboarding = () => {
    window.location.href = "/";
  };

  const activeStepMeta = stepDetails[currentStep - 1] ?? stepDetails[0];
  const isFinalStep = currentStep === TOTAL_STEPS;
  const nextButtonLabel = isFinalStep
    ? "رفتن به صفحه سفر"
    : currentStep === 3
      ? "تایید و ادامه"
      : "ادامه";

  const isNextDisabled =
    currentStep === 2 &&
    (!tripData?.OriginLocation || !tripData?.DestinationLocation);

  const SWIPE_MIN_DISTANCE = 60; // pixels
  const SWIPE_MAX_DURATION = 700; // ms
  const SWIPE_MAX_OFF_AXIS = 80; // pixels

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    // Only react to primary mouse button or touch/pen interactions
    if (event.pointerType === "mouse" && event.button !== 0) return;

    swipeStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      time: Date.now(),
      pointerId: event.pointerId,
    };
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLElement>) => {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;

    if (!start || start.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - start.x;
    const deltaY = Math.abs(event.clientY - start.y);
    const duration = Date.now() - start.time;

    const isHorizontalSwipe =
      duration <= SWIPE_MAX_DURATION &&
      deltaX >= SWIPE_MIN_DISTANCE &&
      deltaY <= SWIPE_MAX_OFF_AXIS;

    if (isHorizontalSwipe && !isNextDisabled) {
      nextStep();
    }
  };

  const handlePointerCancel = () => {
    swipeStartRef.current = null;
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <OnboardingStep1 key="step1" />;
      case 2:
        return (
          <OnboardingStep4
            key="step4"
            onSelectLocation={handleOpenLocationPicker}
          />
        );
      case 3:
        return <OnboardingStep2 key="step2" />;
      case 4:
        return <OnboardingStep3 key="step3" />;
      default:
        return <OnboardingStep1 key="step1" />;
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen flex-col pb-32 sm:pb-36">
        <header className="px-3 pt-4 pb-2 sm:px-6" dir="ltr">
          <div className="flex items-center justify-between gap-3">
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: -12 }}
              transition={{ delay: 0.35 }}
            >
              <Button
                className="text-default-500 hover:text-default-700"
                color="default"
                variant="light"
                onClick={skipOnboarding}
              >
                رد کردن
              </Button>
            </motion.div>

            <motion.div
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center"
              initial={{ opacity: 0, x: 24 }}
              transition={{ delay: 0.3 }}
            >
              <Image
                priority
                alt="MrShoofer"
                className="h-8 w-auto object-contain sm:h-9"
                height={36}
                src="/mrshoofer_logo_full.png"
                width={160}
              />
            </motion.div>
          </div>
        </header>

        {/* Step Content */}
        <div className="flex-1 px-3 sm:px-5 lg:px-8 min-h-0 py-2 sm:py-4 pb-20 sm:pb-24">
          <div className="grid h-full max-w-6xl mx-auto gap-3 lg:gap-5 lg:grid-cols-[300px,1fr]">
            <motion.aside
              animate={{ opacity: 1, y: 0 }}
              className="hidden lg:flex flex-col justify-between rounded-[32px] border border-white/60 bg-white/80 p-6 shadow-2xl backdrop-blur-xl"
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="space-y-2 text-right">
                <p className="text-xs font-semibold text-primary-500">
                  مسیر سفر شما
                </p>
                <h2 className="text-2xl font-black text-slate-900">
                  {activeStepMeta.title}
                </h2>
                <p className="text-sm text-slate-600">
                  {activeStepMeta.description}
                </p>
              </div>

              <div className="space-y-3">
                {activeStepMeta.highlights?.map((highlight) => (
                  <div
                    key={highlight.label}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white/70 px-4 py-3 shadow-sm"
                  >
                    <div className="text-right">
                      <p className="text-xs text-slate-500">
                        {highlight.label}
                      </p>
                      <p className="text-base font-semibold text-slate-900">
                        {highlight.value}
                      </p>
                    </div>
                    <Icon
                      className={`text-2xl ${highlight.accent}`}
                      icon={highlight.icon}
                    />
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white/90 to-slate-50 p-5 text-right shadow-inner">
                <p className="text-xs font-semibold text-slate-500">
                  {activeStepMeta.tipLabel}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {activeStepMeta.tip}
                </p>
              </div>
            </motion.aside>

            <div className="relative flex items-stretch min-h-[60vh] sm:min-h-[68vh] lg:min-h-full">
              <div className="w-full h-full flex items-stretch">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={currentStep}
                    animate="in"
                    className="w-full h-full flex-1"
                    exit="out"
                    initial="initial"
                    style={{ touchAction: "pan-y" }}
                    onPointerDown={handlePointerDown}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerCancel}
                    onPointerLeave={handlePointerCancel}
                    variants={pageVariants}
                  >
                    {renderStep()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation & Progress */}
        <div
          className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 px-3 pb-3"
          style={{
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)",
          }}
        >
          <div className="pointer-events-auto mx-auto w-full max-w-2xl rounded-2xl border border-slate-100/80 bg-white/95 px-3 py-2.5 shadow-lg backdrop-blur-sm sm:px-4">
            <div className="flex flex-col gap-1.5">
              <ProgressDots
                currentStep={currentStep}
                totalSteps={TOTAL_STEPS}
              />

              <AnimatePresence initial={false} mode="wait">
                {currentStep === 1 ? (
                  <motion.div
                    key="single-next"
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    initial={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Button
                      className="h-11 w-full justify-center gap-2 rounded-2xl text-sm font-semibold sm:h-12 sm:text-base"
                      color="primary"
                      size="lg"
                      onClick={nextStep}
                    >
                      {nextButtonLabel}
                      <Icon
                        icon={
                          isFinalStep
                            ? "solar:arrow-left-linear"
                            : "solar:arrow-left-linear"
                        }
                        width={20}
                      />
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="dual-nav"
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1.5"
                    exit={{ opacity: 0, y: -8 }}
                    initial={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Button
                      className="h-10 w-[72px] shrink-0 px-2 text-[11px] font-medium sm:h-11 sm:w-[86px] sm:px-2.5 sm:text-xs"
                      color="default"
                      variant="flat"
                      onClick={prevStep}
                    >
                      <Icon icon="solar:arrow-right-linear" width={18} />
                    </Button>

                    <Button
                      className={`h-11 flex-1 justify-center gap-2 rounded-2xl text-sm font-semibold sm:h-12 sm:text-base ${
                        isNextDisabled ? "opacity-50" : ""
                      }`}
                      color="primary"
                      size="lg"
                      onClick={nextStep}
                    >
                      {nextButtonLabel}
                      <Icon
                        icon={
                          isFinalStep
                            ? "solar:arrow-left-linear"
                            : "solar:arrow-left-linear"
                        }
                        width={20}
                      />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <Modal
        backdrop="blur"
        isOpen={isOpen}
        placement="center"
        size="xs"
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col items-center gap-1">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-warning-100">
                  <Icon
                    className="text-2xl text-warning-600"
                    icon="solar:map-point-bold-duotone"
                  />
                </div>
                <span className="text-lg font-bold text-default-900">توجه</span>
              </ModalHeader>
              <ModalBody>
                <p className="text-center font-medium text-default-600">
                  لطفا برای ادامه، ابتدا موقعیت دقیق مبدا و مقصد را مشخص کنید
                </p>
              </ModalBody>
              <ModalFooter className="justify-center pb-6">
                <Button
                  className="w-full max-w-[200px] font-semibold"
                  color="primary"
                  onPress={onClose}
                >
                  متوجه شدم
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </main>
  );
}
