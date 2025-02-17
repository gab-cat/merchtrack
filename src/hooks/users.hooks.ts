import { useQuery } from "@tanstack/react-query";
import { getClerkUserImageUrl, getClerkUserPublicData, getUserByEmail, getUsers } from "@/actions/users.action";
import { QueryParams } from "@/types/common";
import { useResourceByIdQuery, useResourceQuery } from "@/hooks/index.hooks";

/**
 * Custom hook for fetching a paginated list of users.
 * 
 * This hook uses React Query to fetch users with pagination support and caching.
 * Users are cached for 15 minutes and the total count is cached separately.
 * 
 * @param params - Optional query parameters for pagination and field limiting
 * @returns A query object containing the paginated users data and metadata
 * 
 * @example
 * const { data, isLoading } = useUsersQuery({ page: 1, take: 10 });
 */
export function useUsersQuery(params: QueryParams = {}) {
  return useResourceQuery({
    resource: "users",
    fetcher: getUsers,
    params
  });
}

/**
 * Custom hook for fetching a user by their email.
 * 
 * This hook uses React Query to fetch a specific user by email with caching support.
 * The user data is cached for 30 minutes.
 * 
 * @param email - The email of the user to fetch
 * @param limitFields - Optional array of fields to exclude from the response
 * @returns A query object containing the user data if found
 * 
 * @example
 * const { data, isLoading } = useUserByEmailQuery('user@example.com', ['password']);
 */
export function useUserByEmailQuery(email: string | null, limitFields: string[] = []) {
  return useResourceByIdQuery({
    resource: "users",
    fetcher: (userId: string, identifier: string, params: QueryParams) => 
      getUserByEmail({ userId, email: identifier, limitFields: params.limitFields }),
    identifier: email as string,
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