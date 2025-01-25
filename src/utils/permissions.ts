// no-dd-sa:typescript-best-practices/boolean-prop-naming
'use server';
import prisma from "@/lib/db";

type ActionCode = 'logs' | 'reports' | 'profile' | 'users' | 'orders' | 'payments' | 'inventory' | 'dashboard' | 'settings';

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

  console.time('Prisma Query Time');
  const userPermissions = await prisma.userPermission.findMany({
    where: {
      userId: params.userId,
      permissionId: { in: actionCodes }
    },
    select: {  
      permissionId: true,
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: true
    }
  });
  console.timeEnd('Prisma Query Time');

  if (!userPermissions.length) {
    return false;
  }

  return actionCodes.every(actionCode => {
    const userPermission = userPermissions.find(up => up.permissionId === actionCode);
    if (!userPermission) return false;

    const requiredPermissions = params.permissions[actionCode];
    return Object.entries(requiredPermissions || {}).every(([key, value]) => {
      return userPermission[key as keyof typeof userPermission] === value;
    });
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


