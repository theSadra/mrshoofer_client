import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, adminSecret } = await request.json();

    // Security check - only allow admin creation with secret
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid admin secret' },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create the admin user with raw password (no hashing)
    const adminUser = await prisma.user.create({
      data: {
        name,
        email,
        password: password, // Store password as raw text
        isAdmin: true,
        emailVerified: new Date()
      }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = adminUser;

    return NextResponse.json({
      message: 'Admin user created successfully with raw password',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Error creating admin user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // List all admin users (without passwords)
    const admins = await prisma.user.findMany({
      where: { isAdmin: true },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        isAdmin: true,
        image: true
      }
    });

    return NextResponse.json({ admins });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
