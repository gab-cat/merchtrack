'use server';

import { revalidatePath } from "next/cache";
import { UserPermission } from "@prisma/client";
import { UpdateUserPermissionsParams } from "../users.schema";
import prisma from "@/lib/db";
import { verifyPermission } from "@/utils";
import { invalidateCache } from "@/lib/redis";

/**
 * Updates the permissions for a specified user.
 *
 * This function verifies that the current user has the required permission to update user permissions. It then performs an upsert operation within a transaction for each permission provided, ensuring that existing records are updated and new records are created when necessary. After updating, a corresponding log is recorded, the relevant cache is invalidated, and the administration path is revalidated.
 *
 * @param userId - The ID of the user whose permissions are being updated.
 * @param currentUserId - The ID of the user attempting to perform the update. This user must have permission to update user permissions.
 * @param permissions - An object containing the permission updates, where each key is a permission ID and its value contains the update details.
 * @returns A promise that resolves to an object indicating success or failure. On success, the updated permissions are returned; on failure, an error message and details are provided.
 */
export async function updateUserPermissions({ userId, currentUserId, permissions }: UpdateUserPermissionsParams): ActionsReturnType<UserPermission[]> {
  if (!await verifyPermission({
    userId: currentUserId,
    permissions: {
      users: { canUpdate: true }
    },
    logDetails: {
      actionDescription: 'update user permissions',
      userText: `Attempted to update permissions for user ${userId}`
    }
  })) {
    return {
      success: false,
      message: "You are not authorized to update user permissions."
    };
  }

  try {
    const updates = Object.entries(permissions).map(([permissionId, permission]) => 
      prisma.userPermission.upsert({
        where: {
          userId_permissionId: {
            userId: userId,
            permissionId
          }
        },
        update: permission,
        create: {
          userId: userId,
          permissionId,
          ...permission
        }
      })
    );

    const updatedPermissions = await prisma.$transaction(updates);
    
    // Log the permission update
    await prisma.log.create({
      data: {
        reason: 'USER_PERMISSIONS',
        systemText: `Updated permissions for user ${userId}`,
        userText: `Updated user permissions`,
        createdBy: {
          connect: {
            id: currentUserId
          }
        },
        user: {
          connect: {
            id: userId
          }
        }
      }
    });

    revalidatePath('/admin/users/[email]');
    invalidateCache([`permissions:${userId}`]);
    return {
      success: true,
      data: updatedPermissions
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update user permissions";
    return {
      success: false,
      message,
      errors: { error }
    };
  }
} 