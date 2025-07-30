import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, oldPassword, newPassword, adminSecret } = await request.json();

    // Security check
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid admin secret' },
        { status: 401 }
      );
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify old password (handles both plain text and hashed)
    let oldPasswordMatch = false;
    if (user.password) {
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        // Already hashed
        oldPasswordMatch = await bcrypt.compare(oldPassword, user.password);
      } else {
        // Plain text
        oldPasswordMatch = oldPassword === user.password;
      }
    }

    if (!oldPasswordMatch) {
      return NextResponse.json(
        { error: 'Old password is incorrect' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the user
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    return NextResponse.json({
      message: 'Password updated successfully and hashed'
    });

  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
