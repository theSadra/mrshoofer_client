"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Input,
  Checkbox,
  Image,
  Card, 
  CardBody,
  Tabs,
  Tab,
} from "@heroui/react";
import { InputOtp, REGEXP_ONLY_DIGITS } from "@heroui/input-otp";
import { Icon } from "@iconify/react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

import { maskPhoneNumber } from "@/lib/phone-utils";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [authMode, setAuthMode] = useState<"password" | "otp">("password");
  const [otpPhone, setOtpPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();

      if (session?.user) {
        console.log("User already logged in, redirecting to manage");
        router.push("/manage");
      }
    };

    checkSession();
  }, [router]);

  useEffect(() => {
    if (resendTimer <= 0) return;

    const timer = setInterval(() => {
      setResendTimer((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendTimer]);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation
    if (!username.trim() || !password.trim()) {
      setError("لطفاً نام کاربری و رمز عبور را وارد کنید");
      setLoading(false);

      return;
    }

    try {
      const result = await signIn("credentials", {
        username: username.trim(),
        password: password.trim(),
        redirect: false,
      });

      if (result?.error) {
        setError("نام کاربری یا رمز عبور اشتباه است");
        setLoading(false);
      } else if (result?.ok) {
        setError("");
        // Wait a moment for session to be established
        setTimeout(() => {
          router.push("/manage");
        }, 1000);
      } else {
        console.log("❌ Unexpected login result:", result);
        setError("خطایی در ورود رخ داد. دوباره تلاش کنید");
        setLoading(false);
      }
    } catch (err) {
      console.error("🚨 Login exception:", err);
      setError("خطای شبکه. لطفاً اتصال اینترنت خود را بررسی کنید");
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    setOtpError("");
    setOtpSuccess("");

    if (!otpPhone.trim()) {
      setOtpError("لطفاً شماره موبایل را وارد کنید");

      return;
    }

    setOtpSending(true);

    try {
      const apiUrl = "/manage/api/auth/request-otp";
      console.log("[OTP Client] Sending request to", apiUrl);
      const res = await fetch(new URL(apiUrl, window.location.origin).href, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: otpPhone }),
      });

      console.log("[OTP Client] Response status:", res.status);
      
      let data;
      try {
        data = await res.json();
        console.log("[OTP Client] Response data:", data);
      } catch (jsonErr) {
        console.error("[OTP Client] Failed to parse JSON response:", jsonErr);
        setOtpError("پاسخ سرور نامعتبر است");
        return;
      }

      if (!res.ok) {
        const errorMsg = data?.error || `خطا ${res.status}: ارسال کد با خطا مواجه شد`;
        console.error("[OTP Client] Server error:", errorMsg, data?.details);
        setOtpError(errorMsg);
      } else {
        setOtpSent(true);
        setOtpCode("");
        setOtpSuccess("کد تایید برای شما ارسال شد");
        setResendTimer(60);
      }
    } catch (otpErr) {
      console.error("[OTP Client] Network/fetch error:", otpErr);
      setOtpError(`خطای شبکه: ${otpErr instanceof Error ? otpErr.message : 'اتصال به سرور برقرار نشد'}`);
    } finally {
      setOtpSending(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setOtpError("");
    setOtpSuccess("");

    if (!otpSent) {
      setOtpError("ابتدا کد تایید را دریافت کنید");

      return;
    }

    if (otpCode.trim().length < 4) {
      setOtpError("کد تایید صحیح نیست");

      return;
    }

    setOtpVerifying(true);

    try {
      const result = await signIn("credentials", {
        username: otpPhone,
        otpCode: otpCode.trim(),
        loginMethod: "otp",
        redirect: false,
      });

      if (result?.error) {
        setOtpError("کد تایید معتبر نیست یا منقضی شده است");
      } else if (result?.ok) {
        router.push("/manage");
      } else {
        setOtpError("خطا در ورود. دوباره تلاش کنید");
      }
    } catch (otpLoginErr) {
      console.error("OTP login error", otpLoginErr);
      setOtpError("خطای غیرمنتظره. دوباره تلاش کنید");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleTabChange = (key: React.Key) => {
    setAuthMode(key as "password" | "otp");
    setError("");
    setOtpError("");
    setOtpSuccess("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardBody className="p-8">
          {/* Logo */}
          <div className="flex justify-center mb-2">
            <Image
              alt="MrShoofer Logo"
              className="object-contain"
              height={80}
              src="/mrshoofer_logo_full.png"
              width={150}
            />
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              خوش آمدید 👋
            </h1>
            <p className="text-gray-600">برای ادامه وارد حساب مدیریت شوید</p>
          </div>

          <Tabs
            fullWidth
            aria-label="login methods"
            className="mb-4"
            selectedKey={authMode}
            size="md"
            onSelectionChange={handleTabChange}
          >
            <Tab key="password" title="ورود با رمز">
              <form className="space-y-4" onSubmit={handleSubmit}>
                <Input
                  isRequired
                  className="mb-4"
                  label="نام کاربری / ایمیل / شماره موبایل"
                  placeholder="نام کاربری خود را وارد کنید"
                  startContent={
                    <Icon
                      className="text-xl text-default-400 pointer-events-none flex-shrink-0"
                      icon="solar:user-linear"
                    />
                  }
                  type="text"
                  value={username}
                  variant="bordered"
                  onChange={(e) => setUsername(e.target.value)}
                />

                <Input
                  isRequired
                  className="mb-4"
                  endContent={
                    <button
                      className="focus:outline-none"
                      tabIndex={-1}
                      type="button"
                      onClick={toggleVisibility}
                    >
                      <Icon
                        className="text-xl text-default-400 pointer-events-none"
                        icon={
                          isVisible
                            ? "solar:eye-closed-linear"
                            : "solar:eye-linear"
                        }
                      />
                    </button>
                  }
                  label="رمز عبور"
                  placeholder="رمز عبور خود را وارد کنید"
                  startContent={
                    <Icon
                      className="text-xl text-default-400 pointer-events-none flex-shrink-0"
                      icon="solar:lock-linear"
                    />
                  }
                  type={isVisible ? "text" : "password"}
                  value={password}
                  variant="bordered"
                  onChange={(e) => setPassword(e.target.value)}
                />

                <div className="flex items-center justify-between py-2">
                  <Checkbox disabled size="sm">
                    مرا به خاطر بسپار
                  </Checkbox>
                  <span className="text-sm text-gray-500 cursor-pointer hover:text-blue-600">
                    رمز عبور را فراموش کرده‌اید؟
                  </span>
                </div>

                {error && (
                  <p className="text-danger text-sm text-center mb-2 ">{error}</p>
                )}

                <Button
                  className="w-full py-3 text-md font-md"
                  color="primary"
                  isLoading={loading}
                  size="lg"
                  type="submit"
                >
                  {loading ? "در حال ورود..." : "ورود به پنل مدیریت"}
                </Button>
              </form>
            </Tab>

            <Tab key="otp" title="ورود با پیامک">
              <form className="space-y-4" onSubmit={handleOtpSubmit}>
                <Input
                  isRequired
                  label="شماره موبایل مدیر"
                  placeholder="مثال: 09123456789"
                  startContent={
                    <Icon
                      className="text-xl text-default-400 pointer-events-none flex-shrink-0"
                      icon="solar:phone-linear"
                    />
                  }
                  type="tel"
                  value={otpPhone}
                  variant="bordered"
                  onChange={(e) => setOtpPhone(e.target.value)}
                />

                <Button
                  className="w-full"
                  color="primary"
                  isDisabled={otpSending || resendTimer > 0 || !otpPhone.trim()}
                  isLoading={otpSending}
                  variant="bordered"
                  onPress={handleSendOtp}
                >
                  {resendTimer > 0
                    ? `ارسال مجدد در ${resendTimer} ثانیه`
                    : "دریافت کد"}
                </Button>

                {otpError && (
                  <p className="text-danger text-sm text-center">{otpError}</p>
                )}
                {otpSuccess && (
                  <p className="text-success text-sm text-center">{otpSuccess}</p>
                )}

                {otpSent && (
                  <div className="space-y-4">
                    <div className="space-y-3 text-center" dir="rtl">
                      <p className="text-sm text-gray-600 mb-2">
                        کد تایید برای شماره {otpPhone} ارسال شد
                      </p>
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpCode("");
                          setOtpError("");
                          setOtpSuccess("");
                          setResendTimer(0);
                        }}
                      >
                        تغییر شماره
                      </button>
                      <div className="flex justify-center" dir="ltr">
                        <InputOtp
                          allowedKeys={REGEXP_ONLY_DIGITS}
                          length={5}
                          size="lg"
                          value={otpCode}
                          variant="bordered"
                          onValueChange={setOtpCode}
                        />
                      </div>
                    </div>

                    <Button
                      className="w-full py-3 text-md font-md"
                      color="primary"
                      isDisabled={otpCode.trim().length < 4}
                      isLoading={otpVerifying}
                      size="lg"
                      type="submit"
                    >
                      {otpVerifying ? "در حال ورود..." : "ورود با کد پیامکی"}
                    </Button>
                  </div>
                )}
              </form>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
}
