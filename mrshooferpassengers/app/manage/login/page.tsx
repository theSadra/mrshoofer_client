"use client";

import React, { useState } from "react";
import { Button, Input, Checkbox, Image } from "@heroui/react";
import { Icon } from "@iconify/react";
import { signIn } from "next-auth/react";

export default function AdminLoginPage() {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) setError("ورود ناموفق. اطلاعات وارد شده صحیح نیست.");
    else window.location.href = "/manage";
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="flex flex-col items-center pb-2">


        <div className="flex align-baseline">
          <Image
            height={95}
            width={180}
            src="/mrshoofer_logo_full.png"
            className="object-contain"
          />
        </div>
      </div>
      <div className="mt-1 flex w-full max-w-sm flex-col gap-1 rounded-large bg-background/80 px-8 py-6 shadow-small">

        <p className="text-center font-semibold text-lg text-default-800">خوش آمدید</p>
        <p className="text-small text-default-500 mb-4 text-center">برای ادامه وارد حساب مدیریت شوید</p>

        <form className="flex flex-col gap-3" onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit(e)}>
          <Input
            label="نام کاربری"
            name="username"
            placeholder="نام کاربری خود را وارد کنید"
            type="text"
            variant="bordered"
            value={username}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            required
          />
          <Input
            endContent={
              <button type="button" onClick={toggleVisibility} tabIndex={-1}>
                {isVisible ? (
                  <Icon
                    className="pointer-events-none text-2xl text-default-400"
                    icon="solar:eye-closed-linear"
                  />
                ) : (
                  <Icon
                    className="pointer-events-none text-2xl text-default-400"
                    icon="solar:eye-bold"
                  />
                )}
              </button>
            }
            label="رمز عبور"
            name="password"
            placeholder="رمز عبور خود را وارد کنید"
            type={isVisible ? "text" : "password"}
            variant="bordered"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
          />
          <div className="flex items-center justify-between px-1 py-2">
            <Checkbox name="remember" size="sm" disabled>
              مرا به خاطر بسپار
            </Checkbox>
            <span className="text-default-500 text-sm">رمز عبور را فراموش کرده‌اید؟</span>
          </div>
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
          <Button color="primary" type="submit" isLoading={loading}>
            {loading ? "در حال ورود..." : "ورود"}
          </Button>
        </form>
      </div>
    </div>
  );
}
