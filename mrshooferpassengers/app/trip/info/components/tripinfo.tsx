"use client";

import React from 'react'
import { Trip } from '@prisma/client'

import { Snippet } from "@heroui/snippet";

import { Card } from '@heroui/card'

import { Image } from '@heroui/react';

import {Divider} from "@heroui/divider";

import {Chip} from "@heroui/chip";

import {Badge} from "@heroui/badge";

import Steps from "./steps"


type TripInfoProps = {
  trip: Trip
}

function TripInfo({ trip }: TripInfoProps) {
  return (
    <div>
      <h1 className='text-3xl font-bold'>
        اطلاعات سفر
      </h1>

      <p className='font-light text-sm mt-1 ms-2'>
        جزییات سفر شما
      </p>

      <Card className='mt-4 flex flex-col justify-between pt-2 pb-3 px-0 rounded-3xl'>



        <div className='flex flex-col mt-5'>


          <div className="flex justify-between px-7">
            <label className='font-light text-sm'  >
              📍مبدا
            </label>

            <label className='font-light text-sm' >
              📍مقصد
            </label>
          </div>


          <div className='flex justify-around py-1 px-8 font-bold '>
            <label className='font-semibold text-lg' >
              تهران
            </label>

            <span className='text-gray-400 text-lg'>
              .....🚕.....
            </span>

            <label className='font-semibold text-lg'>
              اصفهان
            </label>





          </div>

        </div>



        <div className='flex flex-col mt-3'>



          <span className='text-sm ms-4'>
            شروع سفر
          </span>

          <div className='mt-0 flex flex-col justify-between py-2 px-0 rounded-2xl'>



            <div className='flex justify-between px-5 py-1 align-baseline'>


              <div className='flex justify-between gap-2'>

                <div className='self-center bg-gray-100 p-1  rounded-2xl'>

                  <Image
                    src="/icons8-calendar-48.png" // Make sure the file is in public/icons8-calendar.png
                    alt="Calendar"
                    width={40}
                    height={40}
                    className="cursor-pointer"
                  />

                </div>

                <div className='flex flex-col align-middle'>




                  <label className='font-light'>
                  <span className='font-semibold ms-1 block'>
                      12 اردیبهشت
                    </span>
                    دوشنبه

                    
                  </label>

                  <label className='font-light text-sm text-start align-middle'>
                    1403/2/12
                  </label>
                </div>

              </div>


              <div className='flex flex-col pe-2 justify-around'>

                <p className='text-xs font-light'>

                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4 inline me-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>

                  ساعت
                </p>


                <label className='font-semibold text-md self-center '>
                  14:25
                  <span className="text-sm font-light ms-1">

                    ق.ظ
                  </span>
                </label>

              </div>
            </div>


            <div>

            </div>




          </div>


          <Divider className="my-2" />


            <div className='flex justify-between px-6'>
            <Chip color="warning" variant="shadow">
        سرویس VIP
      </Chip>


      <Chip color="warning" className='text-gray-700'  variant="bordered">
        کمری|سافران|سوناتا
      </Chip>


            </div>



        </div>

      </Card>


<Steps>

</Steps>

    </div>
  )
}

export default TripInfo