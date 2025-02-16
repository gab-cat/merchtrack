import { getUser, getUsers } from "@/actions/users.action";
import { useResourceByIdQuery, useResourceQuery } from "@/hooks/index.hooks";
import { QueryParams } from "@/types/common";

export function useUsersQuery(params: QueryParams = {}) {
  const { where, include, orderBy, take = 10, skip, page } = params;

  return useResourceQuery({
    resource: "users",
    fetcher: (userId: string, params: QueryParams) => getUsers({ userId, params }),
    params: {
      where: {
        isDeleted: false,
        ...where
      },
      include: {
        ...include,
        permissions: true // Always include permissions for role management
      },
      orderBy: orderBy || { createdAt: 'desc' },
      take,
      skip,
      page
    }
  });
}

export function useUserQuery(userId: string, limitFields: string[] = []) {
  return useResourceByIdQuery({
    resource: "users",
    fetcher: (userId: string, id: string, params: QueryParams) => 
      getUser({ userId, userLookupId: id, limitFields: params.limitFields }),
    identifier: userId,
    params: { limitFields }
  });
}
