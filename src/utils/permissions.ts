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
 * @param {VerifyPermissionParams} params - The parameters for verifying permissions.
 * @param {string} params.userId - The ID of the user whose permissions are being verified.
 * @param {Object} params.permissions - An object where each key is an action code and the value is the required permissions.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating if the user has the required permissions.
 */
export const verifyPermission = async (params: VerifyPermissionParams): Promise<boolean> => {
  const actionCodes = Object.keys(params.permissions) as ActionCode[];

  let userPermissions: UserPermission[] | null = await getCached<UserPermission[]>(`permissions:${params.userId}`);
  if (!userPermissions) {
    try {
      userPermissions = (await prisma.userPermission.findMany({
        where: {
          userId: { equals: params.userId },
          permissionId: { in: actionCodes }
        },
        select: {  
          permissionId: true,
          canCreate: true,
          canRead: true,
          canUpdate: true,
          canDelete: true
        }
      })) as UserPermission[];
      if (userPermissions.length) await setCached(`permissions:${params.userId}`, userPermissions);
    } catch {
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

  return actionCodes.every(actionCode => {
    const userPermission = userPermissionMap[actionCode];
    if (!userPermission) return false;

    const requiredPermissions = params.permissions[actionCode];
    return Object.entries(requiredPermissions || {}).every(([key, value]) => 
      userPermission[key as keyof typeof userPermission] === value
    );
  });
};

// Usage example:

// // Verify if a user has read permissions for 'logs' and write permissions for 'dashboard'
// const userId = 'user-123';
// const permissions = {
//   logs: { canRead: true },
//   dashboard: { canCreate: true }
// };

// verifyPermission({ userId, permissions })
//   .then(permission => {
//     if (permission) {
//       console.log('User has the required permissions.');
//     } else {
//       console.log('User does not have the required permissions.');
//     }
//   })
//   .catch(error => {
//     console.error('Error verifying permissions:', error);
//   });


