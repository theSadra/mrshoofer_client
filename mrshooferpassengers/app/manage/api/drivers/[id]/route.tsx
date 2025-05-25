import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /manage/api/drivers/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    const driver = await prisma.driver.findUnique({ where: { id } });
    if (!driver) return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    return NextResponse.json(driver);
}

// PUT /manage/api/drivers/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const id = Number(params.id);
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    const body = await req.json();
    const { Firstname, Lastname, PhoneNumber, CarName } = body;
    if (!Firstname || !Lastname || !PhoneNumber) {
        return NextResponse.json({ error: "تمام فیلدها الزامی هستند" }, { status: 400 });
    }
    try {
        const updated = await prisma.driver.update({
            where: { id },
            data: { Firstname, Lastname, PhoneNumber, CarName },
        });
        return NextResponse.json(updated);
    } catch (e) {
        return NextResponse.json({ error: "خطا در ویرایش راننده" }, { status: 500 });
    }
}
