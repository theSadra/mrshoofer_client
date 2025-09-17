import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get all admin users (without passwords for security)
    const admins = await prisma.user.findMany({
      where: { isAdmin: true },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        emailVerified: true,
      },
    });

    return NextResponse.json({
      message: "Admin users found",
      count: admins.length,
      admins: admins,
    });
  } catch (error) {
    console.error("Error fetching admin users:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 },
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        isAdmin: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found",
        email: email,
      });
    }

    const passwordMatch = user.password === password;

    return NextResponse.json({
      success: passwordMatch && user.isAdmin,
      userFound: true,
      isAdmin: user.isAdmin,
      passwordMatch: passwordMatch,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Error testing credentials:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
