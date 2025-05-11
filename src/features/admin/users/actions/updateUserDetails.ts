'use server';

import { revalidatePath } from "next/cache";
import { UpdateUserParams } from "../users.schema";
import prisma from "@/lib/db";
import { verifyPermission } from "@/utils";
import { createLog } from "@/actions/logs.actions";
import clerk from "@/lib/clerk";

/**
 * Updates user details in both Prisma and Clerk
 * 
 * @param userId - The ID of the user performing the action
 * @param targetUserId - The ID of the user to be updated
 * @param data - The user data to be updated
 * @returns A promise that resolves to an object indicating success or failure
 */
export async function updateUserDetails({ userId, targetUserId, data }: UpdateUserParams): ActionsReturnType<never> {
  if (!await verifyPermission({ userId, permissions: { users: { canUpdate: true } } })) {
    return { success: false, message: "Permission denied." };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!existingUser) {
      return { success: false, message: "User not found." };
    }

    // Create log of changes
    const changes = Object.entries(data).reduce((acc: string[], [key, value]) => {
      if (existingUser[key as keyof typeof existingUser] !== value) {
        acc.push(`${key}: ${existingUser[key as keyof typeof existingUser]} → ${value}`);
      }
      return acc;
    }, []);

    if (changes.length === 0) {
      return { success: false, message: "No changes detected." };
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data
    });

    // Update Clerk user metadata
    const clerkClient = await clerk;
    await clerkClient.users.updateUser(existingUser.clerkId, {
      publicMetadata: {
        data: updatedUser,
        isOnboardingCompleted: true,
      }
    });

    // Log the changes
    await createLog({
      userId: targetUserId,
      createdById: userId,
      reason: "User Profile Updated",
      systemText: `User profile updated with changes: ${changes.join(", ")}`,
      userText: "Your profile has been updated successfully."
    });

    revalidatePath(`/admin/users/${existingUser.email}`);
    return { success: true, message: "User details updated successfully." };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, message: (error as Error).message };
  }
} 