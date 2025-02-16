// no-dd-sa:typescript-best-practices/boolean-prop-naming
'use server';
import prisma from "@/lib/db";
import { getCached, setCached } from '@/lib/redis';


type ActionCode = 'logs' | 'reports' | 'profile' | 'users' | 'orders' | 'payments' | 'inventory' | 'dashboard' | 'settings' | 'messages';

type RequiredPermissions = {
  canCreate?: boolean, 
  canRead?: boolean, 
  canUpdate?: boolean, 
  canDelete?: boolean 
};

type VerifyPermissionParams = {
  userId: string;
  permissions: {
    [key in ActionCode]?: RequiredPermissions;
  };
  logDetails?: {
    actionDescription?: string;
    userText?: string;
  }
}

type UserPermission = {
  permissionId: ActionCode;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
};

// Use redis in the future to cache user permissions


/**
 * Verifies if a user has the required permissions for the specified action codes.
 * Automatically logs unauthorized access attempts.
 */
export const verifyPermission = async (params: VerifyPermissionParams): Promise<boolean> => {
  const actionCodes = Object.keys(params.permissions) as ActionCode[];

  let userPermissions: UserPermission[] | null = await getCached<UserPermission[]>(`permissions:${params.userId}`);
  if (!userPermissions) {
    try {
      userPermissions = (await prisma.userPermission.findMany({
        where: {
          userId: { equals: params.userId },
        },
        select: {  
          permissionId: true,
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true
        }
      })) as UserPermission[];
      if (userPermissions.length) await setCached(`permissions:${params.userId}`, userPermissions, '30m');
    } catch (error) {
      // no-dd-sa:typescript-best-practices/no-console
      console.error('Error fetching user permissions:', error);
      return false;
    }
  }

  if (!userPermissions.length) {
    return false;
  }

  // Create a map for O(1) lookup
  const userPermissionMap = Object.fromEntries(
    userPermissions.map(up => [up.permissionId, up])
  );

  const hasPermission = actionCodes.every(actionCode => {
    const userPermission = userPermissionMap[actionCode];
    if (!userPermission) return false;

    const requiredPermissions = params.permissions[actionCode];
    return Object.entries(requiredPermissions || {}).every(([key, value]) => 
      userPermission[key as keyof typeof userPermission] === value
    );
  });

  if (!hasPermission) {
    // Log unauthorized access attempt
    await prisma.log.create({
      data: {
        reason: "Unauthorized Access Attempt",
        systemText: `User attempted to access restricted functionality: ${
          params.logDetails?.actionDescription || Object.keys(params.permissions).join(', ')
        }`,
        userText: params.logDetails?.userText || "No additional details provided",
        createdBy: {
          connect: { id: params.userId }
        }
      }
    });

    return false;
  }

  return true;
};


