import { Badge } from "@heroui/badge";
import { Chip } from "@heroui/chip";
import { Prisma, TripStatus } from "@prisma/client";
import React from "react";

type TripInfoProps = {
  trip: Prisma.TripGetPayload<{ include: { Location: true } }>;
};

function tripinfotext({ trip }: TripInfoProps) {
  let statusContent;
  switch (trip.status) {
    case TripStatus.wating_info:
      statusContent = (
        <>
          <div className="flex justify-center mb-1">
            <h1 className="font-lg text-center" id="getting-started">
              فقط یک مرحله باقی مانده است ⚠️
            </h1>
          </div>

          <p className="mb-2 text-small text-center text-default-500">
            برای تکمیل اطلاعات سفر، مومقعیت مبدا را اضافه کنید
          </p>
        </>
      );
      break;
    case TripStatus.wating_start:
      statusContent = (
        <>
          <h1
            className="mb-2 font-md text-center py-2 bg-green-100 border-solid border rounded-2xl"
            id="getting-started"
          >
            سفر شما آمادست! ✅
          </h1>
          <p className="mb-5 text-small text-center font-light text-default-500">
            همه چیز برای یک سفر آرام و به موقع، مهیاست
          </p>
        </>
      );
      break;

    case TripStatus.canceled:
      statusContent = (
        <div className="flex flex-col items-center justify-center text-center">
          <h1
            className="mb-2 font-md font-light py-2 bg-default-100 border-solid border rounded-2xl"
            id="getting-started"
          >
            سفر سواری شما لغو شده است
          </h1>
          <p className="mb-1 text-small font-light text-default-500">
            در صورت نیاز می‌توانید با تیم مسترشوفر در تماس باشید
          </p>

          <p className="mb-5 text-xs font-light text-default-500">
            به امید دیدار مجدد
          </p>
        </div>
      );
      break;

    //     case TripStatus.intrip:
    //         statusContent = (<>
    //             <h1 className="mb-2 text-xl font-medium" id="getting-started">
    //     همه چیز آمادست! ✅
    //   </h1>
    //   <p className="mb-5 text-small text-default-500">
    //     همه چیز برای یک سفر آرام و به موقع، مهیاست
    //   </p>
    //     </>)
    //         break;
    default:
      statusContent = (
        <>
          <h1 className="mb-1 font-md text-center" id="getting-started">
            مسترشوفر، سفر خوشی را برای شما آرزو می‌کند 🌷
          </h1>
          <p className="mb-5 text-center text-small font-light text-default-500">
            مسترشوفر، تا آخر سفر همراه شماست و می‌توانید در حین سفر یا بعد از
            آن، با ما در تماس باشید
          </p>
        </>
      );

      break;
  }

  return statusContent;
}

export default tripinfotext;
