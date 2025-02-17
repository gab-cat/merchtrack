import { useQuery } from "@tanstack/react-query";
import { getClerkUserImageUrl, getClerkUserPublicData, getUser, getUsers } from "@/actions/users.action";
import { useResourceByIdQuery, useResourceQuery } from "@/hooks/index.hooks";
import { QueryParams } from "@/types/common";

/**
 * Fetches a list of users with configurable filtering and pagination.
 *
 * This hook queries the "users" resource and applies default filters to ensure that deleted users are excluded (by setting `isDeleted` to false) and that user permissions are always included for role management. In addition to these defaults, you can customize the query using the provided parameters to filter results, adjust pagination, and override the default ordering.
 *
 * @param params - Optional query parameters for fetching users:
 *   - where: An object containing filter conditions. Defaults to excluding deleted users.
 *   - include: An object specifying related data to include in the query. The hook always includes permissions.
 *   - orderBy: Criteria for ordering results. Defaults to `{ createdAt: 'desc' }` if not provided.
 *   - take: The number of users to retrieve per request. Defaults to 10.
 *   - skip: Number of users to skip before starting to collect the result set.
 *   - page: The page number for pagination.
 *
 * @returns The resource query result for users.
 */
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

/**
<<<<<<< HEAD
 * Retrieves detailed data for a specific user.
 *
 * This hook leverages the useResourceByIdQuery hook with a custom fetcher that
 * calls the getUser function. It fetches user data based on the provided user identifier.
 * Additionally, it accepts an optional array of field names to limit the resulting data.
 * The fetcher internally passes the userId as the lookup identifier along with the provided
 * limitFields.
 *
 * @param userId - The unique identifier of the user to query.
 * @param limitFields - An optional array specifying which fields to include in the result; defaults to an empty array.
 * @returns The resource query result object for the specified user.
 */
export function useUserQuery(userId: string, limitFields: string[] = []) {
  return useResourceByIdQuery({
    resource: "users",
    fetcher: (userId: string, id: string, params: QueryParams) => 
      getUser({ userId, userLookupId: id, limitFields: params.limitFields }),
    identifier: userId,
    params: { limitFields }
  });
}


/**
 * Custom hook for fetching a user's public data from Clerk.
 * 
 * @param userId - The Clerk user ID to fetch data for
 * @returns A query object containing the user's public data
 * 
 * @example
 * const { data, isLoading } = useClerkUserPublicData('user_123');
 */
export function useClerkUserPublicData(userId: string | null) {
  return useQuery({
    queryKey: ['clerk-user', userId],
    queryFn: () => getClerkUserPublicData(userId as string),
    enabled: !!userId
  });
}

/**
 * Custom hook for fetching a user's profile image URL from Clerk.
 * The image URL is cached for 30 minutes.
 * 
 * @param userId - The Clerk user ID to fetch the image URL for
 * @returns A query object containing the user's image URL
 * 
 * @example
 * const { data, isLoading } = useClerkUserImageUrl('user_123');
 */
export function useClerkUserImageUrl(userId: string | null) {
  return useQuery({
    queryKey: ['clerk-user-image', userId],
    queryFn: () => getClerkUserImageUrl(userId as string),
    enabled: !!userId
  });
}
