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

  return useResourceQuery({
    resource: "users",
    fetcher: (userId: string, params: QueryParams) => getUsers({ userId, params }),
    params: {
      ...params,
    }
  });
}

/**
 * Retrieves detailed data for a specific user.
 *
 * This hook leverages the useResourceByIdQuery hook with a custom fetcher that calls the getUser function.
 * It fetches user data based on the provided user identifier and optionally limits the returned data
 * to the specified fields. The fetcher passes the userId as both the lookup identifier and part of the query parameters.
 *
 * @param userId - The unique identifier of the user to query.
 * @param limitFields - An optional array specifying which fields to include in the result; defaults to an empty array.
 * @returns The resource query result object for the specified user.
 */
export function useUserQuery(userId: string, limitFields: string[] = [], include = {}) {
  return useResourceByIdQuery({
    resource: "users",
    fetcher: (userId: string, id: string, params: QueryParams) => 
      getUser({ userId, userLookupId: id, limitFields: params.limitFields }),
    identifier: userId,
    params: { limitFields, include }
  });
}


/**
 * A custom React hook that fetches a user's public data from Clerk.
 *
 * This hook leverages React Query to asynchronously retrieve and cache the public data for a Clerk user.
 * The query is enabled only when a valid `userId` is provided (i.e., non-null); if `userId` is `null`, no query will be executed.
 *
 * @param userId - The unique Clerk user ID for which to fetch data, or `null` to disable the query.
 * @returns An object containing the query state, including data, loading status, and error information.
 *
 * @example
 * const { data, isLoading, error } = useClerkUserPublicData('user_123');
 */
export function useClerkUserPublicData(userId: string | null) {
  return useQuery({
    queryKey: ['clerk-user', userId],
    queryFn: () => getClerkUserPublicData(userId as string),
    enabled: !!userId
  });
}

/**
 * Fetches the profile image URL for a given Clerk user.
 *
 * This hook uses React Query's `useQuery` to retrieve a user's profile image URL by calling the
 * `getClerkUserImageUrl` service. The result is cached for 30 minutes, and the query is enabled only
 * when a valid `userId` is provided.
 *
 * @param userId - The Clerk user ID as a string. If `null`, the query will not execute.
 * @returns A query object containing the status, data (the user's image URL), and potential error information.
 *
 * @example
 * const { data: imageUrl, isLoading, error } = useClerkUserImageUrl('user_123');
 * if (!isLoading && imageUrl) {
 *   console.log('User profile image URL:', imageUrl);
 * }
 */
export function useClerkUserImageUrl(userId: string | null) {
  return useQuery({
    queryKey: ['clerk-user-image', userId],
    queryFn: () => getClerkUserImageUrl(userId as string),
    enabled: !!userId
  });
}

/**
 * Fetches a list of staff members who can be assigned as managers.
 * This hook filters users to only include staff members and excludes deleted accounts.
 */
export function useStaffMembersQuery(params: QueryParams = {}) {
  const queryParams = {
    ...params,
    where: {
      isDeleted: false,
      isStaff: true,
      ...params.where
    }
  };

  return useUsersQuery(queryParams);
}


