'use server';

import { type User } from '@prisma/client';
import prisma from '@/lib/prisma';

interface UpdateUserParams {
  userId: string;
  data: Partial<User>;
}

interface ActionResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function updateUser({ userId, data }: UpdateUserParams): Promise<ActionResponse<User>> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        role: data.role,
        college: data.college,
      }
    });


    return {
      success: true,
      data: updatedUser
    };
  } catch (error) {
    console.error('Error updating user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user'
    };
  }
}