'use client';

import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/stores/user.store";
import type { ExtendedMessage } from "@/types/messages";
import { getMessages, getMessage } from "@/actions/messages.actions";
import { QueryParams } from "@/types/common";
import { useResourceQuery } from "@/hooks/index.hooks";

/**
 * Fetches all messages for the current user.
 *
 * This hook leverages React Query by calling `useResourceQuery` with the resource identifier "messages:all"
 * and the provided query parameters to fetch messages asynchronously. It uses the `getMessages` fetcher to
 * retrieve messages while applying filtering, sorting, and pagination options.
 *
 * The accepted query parameters include:
 * - `where`: Conditions to filter the messages.
 * - `include`: Additional related data to load with the messages.
 * - `orderBy`: Sorting criteria for the messages.
 * - `take`: The number of messages to retrieve (defaults to 12).
 * - `skip`: The number of messages to skip.
 * - `page`: The page number for pagination.
 *
 * On failure, the hook triggers a toast notification and returns an empty paginated response.
 *
 * @param params - An optional object containing query parameters to filter, sort, and paginate the messages.
 * @returns A React Query result containing the messages data on success, or an empty paginated response on failure.
 *
 * @example
 * const { data, error, isLoading } = useMessagesQuery({ where: { isRead: false }, take: 20 });
 */
export function useMessagesQuery(params: QueryParams = {}) {
  const { where, include, orderBy, take = 12, skip, page } = params;
  return useResourceQuery({
    resource: "messages:all", 
    fetcher: getMessages, 
    params: {
      where,
      include,
      orderBy,
      take,
      skip,
      page
    }
  });
}

/**
 * Fetches a specific message by its ID using React Query.
 *
 * Retrieves the current user's ID from the user store and, if a valid messageId is provided,
 * calls the getMessage function to fetch the corresponding message. The query is executed only
 * when both the "enabled" flag is true and "messageId" is non-null; otherwise, it returns null.
 *
 * @param messageId - The unique identifier of the message to fetch; pass null to skip fetching.
 * @param enabled - A flag indicating whether the query should be enabled.
 * @returns The React Query result object, where the data property is an ExtendedMessage on success,
 *          or null if the message is not found or the query is disabled.
 *
 * @example
 * const { data, error, isLoading } = useMessageQuery("msg123", true);
 */
export function useMessageQuery(messageId: string | null, enabled: boolean) {
  const { userId } = useUserStore();
  return useQuery({
    queryKey: [`messages:${messageId}`],
    queryFn: async () => {
      if (!messageId) return null;
      const response = await getMessage({
        userId: userId as string,
        messageId: messageId
      });
      return response.success ? (response.data as ExtendedMessage) : null;
    },
    enabled: enabled && !!messageId
  });
}

export function useUserImageQuery(clerkId: string | undefined) {
  return useQuery({
    enabled: clerkId !== undefined,
    queryKey: [`users:${clerkId}`],
    queryFn: async () => {
      const response = await fetch(`/api/users/image/${clerkId}`);
      if (!response.ok) {
        throw new Error('Error fetching user image');
      }
      const data = await response.json();
      return data.data;
    },
  });
}

