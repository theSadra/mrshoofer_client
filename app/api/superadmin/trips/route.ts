import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // First check database connection
    await prisma.$connect();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const search = (searchParams.get("search") || "").trim();
    const driver = searchParams.get("driver") || "all"; // all | assigned | unassigned
    const location = searchParams.get("location") || "all"; // all | assigned | unassigned
    const status = searchParams.get("status") || "all"; // all | specific status
    const sortBy = searchParams.get("sortBy") || "StartsAt"; // StartsAt
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";
    const dateFrom = searchParams.get("dateFrom"); // ISO string
    const dateTo = searchParams.get("dateTo"); // ISO string

    const where: any = { AND: [] };

    if (search) {
      where.AND.push({
        OR: [
          { TicketCode: { contains: search, mode: "insensitive" } },
          { TripCode: { contains: search, mode: "insensitive" } },
          {
            Passenger: {
              is: { Firstname: { contains: search, mode: "insensitive" } },
            },
          },
          {
            Passenger: {
              is: { Lastname: { contains: search, mode: "insensitive" } },
            },
          },
          { Passenger: { is: { NumberPhone: { contains: search } } } },
          {
            Driver: {
              is: { Firstname: { contains: search, mode: "insensitive" } },
            },
          },
          {
            Driver: {
              is: { Lastname: { contains: search, mode: "insensitive" } },
            },
          },
        ],
      });
    }

    if (driver === "assigned") where.AND.push({ driverId: { not: null } });
    if (driver === "unassigned") where.AND.push({ driverId: null });

    if (location === "assigned") where.AND.push({ locationId: { not: null } });
    if (location === "unassigned") where.AND.push({ locationId: null });

    if (status !== "all") {
      where.AND.push({ status: status });
    }

    if (dateFrom) {
      const from = new Date(dateFrom);

      if (!isNaN(from.getTime())) where.AND.push({ StartsAt: { gte: from } });
    }
    if (dateTo) {
      const to = new Date(dateTo);

      if (!isNaN(to.getTime())) where.AND.push({ StartsAt: { lte: to } });
    }

    // Validate sortBy and sortOrder to prevent injection
    const validSortFields = ["StartsAt", "TicketCode", "id"];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : "StartsAt";
    const safeSortOrder = ["asc", "desc"].includes(sortOrder)
      ? sortOrder
      : "desc";

    const [total, data] = await Promise.all([
      prisma.trip.count({ where }),
      prisma.trip.findMany({
        where,
        include: {
          Passenger: {
            select: { Firstname: true, Lastname: true, NumberPhone: true },
          },
          Driver: {
            select: { Firstname: true, Lastname: true },
          },
        },
        orderBy: { [safeSortBy]: safeSortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return NextResponse.json({
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      data,
    });
  } catch (e: any) {
    console.error("/api/superadmin/trips error", e);

    // Handle specific Prisma connection errors
    if (e.code === "P1001") {
      return NextResponse.json(
        {
          error: "خطا در اتصال به پایگاه داده. لطفا بعداً دوباره تلاش کنید.",
          details: "Database connection failed",
        },
        { status: 503 },
      );
    }

    // Handle other Prisma errors
    if (e.code && e.code.startsWith("P")) {
      return NextResponse.json(
        {
          error: "خطا در پردازش درخواست. لطفا مجدداً تلاش کنید.",
          details: e.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "خطای داخلی سرور",
        details: e.message,
      },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
