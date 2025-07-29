"use client"

import React from 'react'
import Image from "next/image"
import { Button } from "@heroui/button"
import { Card, CardBody } from "@heroui/card";

import HorizontalSteps, {HrHorizontalSteps} from "./horizontal_steps"

function page() {
  return (
    <>
<div className='flex justify-center'>

    <Card >
    <HorizontalSteps
     dir="rtl"
          defaultStep={3}
          steps={[
            {
              title: "انتخاب  سفر",
            },
            {
              title: "ورود اطلاعات",
            },
            {
              title: "پرداخت",
            },
            {
              title: "مبدا و مقصد",
            },
            {
              title: "انجام سفر",
            },
          ]}
        />

        </Card>

</div>

    <section className="w-full py-12 md:py-24 lg:py-24 xl:py-32 container-sm  items-center">
      <Card shadow="lg" isBlurred className='rounded-3xl' >
        <CardBody className='py-10 lg:px-20'>
          <div className="grid gap-7 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4 order-2 lg:order-1">
              <div className="space-5">
                <h1 className="text-center lg:text-start text-3xl font-bold tracking-tighter sm:text-4xl xl:text-5xl/none">
                  از خرید شما متشکریم
                </h1>
                <p className="text-center lg:text-start px-5 lg:px-0 mt-5 font-light text-muted-foreground text-small md:text-medium pt-1">
                  خوشحالیم که برای سفر پیش‌رو، انتخاب شما بودیم، برای ادامه، وارد مرحله‌ی بعد شوید تا آدرس مبدا و جزییات سفر رو از شما دریافت کنیم...
                </p>
              </div>

              <div className='d-flex flex-col lg:flex-row justify-between '>


                <div className="w-full lg:w-auto px-8 lg:px-0 pt-3 flex flex-col items-center lg:flex-row lg:items-center lg:gap-4">
                  <Button size="lg" fullWidth className="lg:w-56 lg:order-2 shadow-lg" color="primary">
                    بزن بریم
                  </Button>
                    <span className="text-blue-500 font-light text-center text-small select-none mt-4">
                      فقط چند مرحله تا تکمیل سفر شما
                    </span>
                </div>


              </div>
            </div>
            <div className="mx-auto w-full max-w-[500px] lg:max-w-none order-1 lg:order-2">
              <div className="aspect-video overflow-hidden rounded-xl">
                <Image
                  src="/hellotaxi.png"
                  alt="Hero image"
                  width={1280}
                  height={720}
                  className="object-contain w-full h-full"
                  priority
                />
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </section>

    </>

  )
}

export default page