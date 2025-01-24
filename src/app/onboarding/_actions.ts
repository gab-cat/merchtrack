'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { User } from '@prisma/client';
import { OnboardingForm, OnboardingFormSchema } from '@/schema/user';
import { AuthenticationError, PrismaError, ValidationError } from '@/types/errors';
import prisma from '@/lib/db';

export const completeOnboarding = async (formData: OnboardingForm): Promise<ActionsReturnType<User>> => {
  const { userId } = await auth();
  if (!userId) throw new AuthenticationError('User not authenticated');

  const { success, data } = OnboardingFormSchema.safeParse(formData);
  if (!success) throw new ValidationError('Server Error: Invalid form data received');

  const existingUser = await prisma.user.findFirst({
    where: { clerkId: userId }
  });

  if (existingUser) {
    throw new PrismaError('A user with this account already exists.');
  }

  const result = await prisma.user.create({
    data: {
      clerkId: userId,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      role: data.role,
      college: data.college,
      courses: data.courses,
      isOnboarded: true
    }
  });

  if (!result) {
    throw new PrismaError('An error occurred while creating user');
  }

  const clerkUpdate = await (await clerkClient()).users.updateUser(userId, {
    publicMetadata: {
      isOnboardingCompleted: true,
      data: result,
    },
  });

  if (!clerkUpdate) {
    throw new PrismaError('An error occurred while updating user metadata');
  }

  return { 
    success: true,
    data: result,
    message: 'User onboarding completed successfully'
  };
};



