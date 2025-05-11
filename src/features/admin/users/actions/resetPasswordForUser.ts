'use server';

import { clerkClient } from "@clerk/nextjs/server";
import { ResetPasswordForUserParams } from "../users.schema";
import { verifyPermission } from "@/utils";

/**
 * Resets the password for a user in Clerk
 * 
 * @param userId - The ID of the user performing the action
 * @param params - Parameters containing the clerkId, newPassword and options
 * @returns A promise that resolves to an object indicating success or failure
 */
export async function resetPasswordForUser(userId: string, { params: { clerkId, newPassword, signOutOfOtherSessions = false, skipLegalChecks = false } }: ResetPasswordForUserParams): ActionsReturnType<never> {
  if (!clerkId) {
    return { success: false, message: "User ID is required." };
  }
  if (!newPassword || newPassword.length < 8) {
    return { success: false, message: "New password is required and must be at least 8 characters long." };
  }

  if (!await verifyPermission({ userId, permissions: { users: { canUpdate: true } } })) {
    return { success: false, message: "Permission denied." };
  }

  try {
    await (await clerkClient()).users.updateUser(clerkId, {
      password: newPassword,
      signOutOfOtherSessions: signOutOfOtherSessions,
      skipLegalChecks: skipLegalChecks
    });
    return { success: true, message: "Password reset successfully." };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
} 