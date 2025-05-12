'use server';

import prisma from '@/lib/db';
import { processActionReturnData } from '@/utils';

/**
 * Get a user's profile information
 */
export async function getUserProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        college: true,
        role: true,
        clerkId: true,
      }
    });

    if (!user) {
      return {
        success: false,
        message: "User not found"
      };
    }

    return {
      success: true,
      data: processActionReturnData(user, [])
    };
  } catch (error: unknown) {
    console.error("Error fetching user profile:", error);
    return {
      success: false,
      message: "Failed to fetch user profile"
    };
  }
} 