import { auth } from '@clerk/nextjs/server';

export const checkRole = async (requiredPermissions: string[]) => {
  const { sessionClaims } = await auth();
  const userPermissions = sessionClaims?.metadata.permissions as string[] || [];
  
  return requiredPermissions.every(permission => 
    userPermissions.includes(permission)
  );
};

// export const requireRoleOrRedirect = async (requiredPermissions: string[], redirectPath: string = '/404') => {
//   const hasRole = await checkRole(requiredPermissions);
//   const user = await currentUser();

  
// };