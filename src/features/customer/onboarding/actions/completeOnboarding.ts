'use server';

import { auth } from '@clerk/nextjs/server';
import { User } from '@prisma/client';
import { OnboardingForm, OnboardingFormSchema } from '@/features/customer/onboarding/users.schema';
import { AuthenticationError, PrismaError, ValidationError } from '@/types/errors';
import prisma from '@/lib/db';
import clerk from '@/lib/clerk';

export const completeOnboarding = async (formData: OnboardingForm): ActionsReturnType<User> => {
  const { userId } = await auth();
  if (!userId) throw new AuthenticationError('User not authenticated');

  try {
    const { success, data } = OnboardingFormSchema.safeParse(formData);
    if (!success) throw new ValidationError('Server Error: Invalid form data received');

    const result = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        role: data.role,
        college: data.college,
        courses: data.courses,
        isOnboarded: true,
        imageUrl: data.imageUrl,
      },
      create: {
        clerkId: userId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        role: data.role,
        college: data.college,
        courses: data.courses,
        isOnboarded: true,
        imageUrl: data.imageUrl,
      }
    });

    const clerkClient = await clerk;
    const clerkUpdate = await clerkClient.users.updateUser(userId, {
      publicMetadata: {
        isOnboardingCompleted: true,
        data: result,
      },
    });

    if (!clerkUpdate) {
      throw new PrismaError('An error occurred while updating user metadata');
    }
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message,
    };
  }

  return { 
    success: true,
    message: 'User onboarding completed successfully'
  };
};



