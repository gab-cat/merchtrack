'use server';

import { auth } from "@clerk/nextjs/server";
import { AssignManagerParams } from "../users.schema";
import prisma from "@/lib/db";
import { verifyPermission } from "@/utils";
import { createLog } from "@/actions/logs.actions";

/**
 * Assigns a manager to a user
 * 
 * @param userId - The ID of the user to be assigned a manager
 * @param managerId - The ID of the manager to be assigned
 * @returns A promise that resolves to an object indicating success or failure
 */
export async function assignManager({ userId, managerId }: AssignManagerParams): ActionsReturnType<never> {
  const { sessionClaims } = await auth();
  if (!await verifyPermission({ userId: sessionClaims?.metadata?.data?.id as string, permissions: { users: { canUpdate: true } } })) {
    return { success: false, message: "Permission denied." };
  }

  if (userId === managerId) {
    return { success: false, message: "User cannot be assigned as their own manager." };
  }

  try {
    // Verify both users exist and manager is a staff member
    const [user, manager, currentUser] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true, isStaff: true, managerId: true }
      }),
      prisma.user.findUnique({
        where: { id: managerId },
        select: { firstName: true, lastName: true, isStaff: true }
      }),
      prisma.user.findUnique({
        where: { id: sessionClaims?.metadata?.data?.id },
        select: { id: true, firstName: true, lastName: true, isStaff: true, isAdmin: true }
      })
    ]);

    if (!user) {
      return { success: false, message: "User not found." };
    }

    if (!manager?.isStaff) {
      return { success: false, message: "Selected user must be a staff member to be assigned as manager." };
    }

    if (!user.isStaff) {
      return { success: false, message: "Only staff members can be assigned a manager." };
    }

    if (!currentUser?.isAdmin) {
      return { success: false, message: "Only admins can assign a manager." };
    }

    if (user.managerId === managerId) {
      return { success: false, message: "User is already assigned to this manager." };
    }

    // Update the user's manager
    await prisma.user.update({
      where: { id: userId },
      data: { managerId }
    });

    // Create a log entry
    await createLog({
      userId,
      createdById: sessionClaims?.metadata.data.id,
      reason: "Manager Assignment",
      systemText: `${manager.firstName} ${manager.lastName} was assigned as manager for ${user.firstName} ${user.lastName}`,
      userText: `Your manager has been updated to ${manager.firstName} ${manager.lastName}`
    });

    return { success: true, message: "Manager assigned successfully." };
  } catch (error) {
    console.error("Error assigning manager:", error);
    return { success: false, message: (error as Error).message };
  }
} 