// "use server";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export async function UpdateLocation(formData: FormData) {
//   const tripId = parseInt((formData.get("tripId") || "").toString(), 10);
//   const lat = parseFloat((formData.get("lat") || "").toString());
//   const lng = parseFloat((formData.get("lng") || "").toString());
//   const address = (formData.get("address") || "").toString();

//   try {
//     const updatedTrip = await prisma.trip.update({
//       where: { id: tripId },
//       data: {
//         Location: {
//           upsert: {
//             create: { lat, lng, address },
//             update: { lat, lng, address },
//           },
//         },
//       },
//     });
//     console.log("Updated trip location:", updatedTrip);
//   } catch (error) {
//     console.error("Error updating trip location:", error);
//   }
// }
