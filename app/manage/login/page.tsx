"use client";

import React, { useState, useEffect } from "react";
import { Button, Input, Checkbox, Image, Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardBody className="p-8">
          {/* Logo */}
          <div className="flex justify-center mb-2">
            <Image
              height={80}
              width={150}
              src="/mrshoofer_logo_full.png"
              alt="MrShoofer Logo"
              className="object-contain"
            />
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">خوش آمدید
              👋
            </h1>
            <p className="text-gray-600">برای ادامه وارد حساب مدیریت شوید</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="نام کاربری یا ایمیل"
              placeholder="نام کاربری خود را وارد کنید"
              type="text"
              variant="bordered"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              isRequired
              className="mb-4"
              startContent={
                <Icon
                  icon="solar:user-linear"
                  className="text-xl text-default-400 pointer-events-none flex-shrink-0"
                />
              }
            />

            <Input
              label="رمز عبور"
              placeholder="رمز عبور خود را وارد کنید"
              type={isVisible ? "text" : "password"}
              variant="bordered"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isRequired
              className="mb-4"
              startContent={
                <Icon
                  icon="solar:lock-linear"
                  className="text-xl text-default-400 pointer-events-none flex-shrink-0"
                />
              }
              endContent={
                <button
                  type="button"
                  onClick={toggleVisibility}
                  className="focus:outline-none"
                  tabIndex={-1}
                >
                  <Icon
                    icon={isVisible ? "solar:eye-closed-linear" : "solar:eye-linear"}
                    className="text-xl text-default-400 pointer-events-none"
                  />
                </button>
              }
            />

            {/* Remember Me */}
            <div className="flex items-center justify-between py-2">
              <Checkbox size="sm" disabled>
                مرا به خاطر بسپار
              </Checkbox>
              <span className="text-sm text-gray-500 cursor-pointer hover:text-blue-600">
                رمز عبور را فراموش کرده‌اید؟
              </span>
            </div>

            {/* Error Message - Positioned above submit button */}
            {error && (
              <p className="text-danger text-sm text-center mb-2 ">
                {error}
              </p>
            )}

            {/* Submit Button */}
            <Button
              color="primary"
              type="submit"
              isLoading={loading}
              className="w-full py-3 text-md font-md"
              size="lg"
            >
              {loading ? "در حال ورود..." : "ورود به پنل مدیریت"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
