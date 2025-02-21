'use server';

import { clerkClient } from "@clerk/nextjs/server";
import { verifyPermission } from "@/utils";
import { ResetUserPasswordType } from "@/schema/user";

type ResetPasswordForUserParams = {
  userId: string;
  params: ResetUserPasswordType;
}

export async function resetPasswordForUser(userId: string, { params: { clerkId, newPassword, signOutOfOtherSessions = false, skipLegalChecks = false } }: ResetPasswordForUserParams): Promise<ActionsReturnType<never>> {
  if (!clerkId) {
    return { success: false, message: "User ID is required." };
  }
  if (!newPassword || newPassword.length < 8) {
    return { success: false, message: "New password is required and must be at least 8 characters long." };
  }

  if (!await verifyPermission({ userId, permissions: { users: { canUpdate: true } } })) {
    return { success: false, message: "Permission denied." };
  }

  console.log("params: ", clerkId, newPassword, signOutOfOtherSessions, skipLegalChecks);

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