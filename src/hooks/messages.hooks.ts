'use client';

import { useQuery } from "@tanstack/react-query";
import { getClerkUserImageUrl } from "@/actions/users.action";
import useToast from "@/hooks/use-toast";
import { useUserStore } from "@/stores/user.store";
import type { ExtendedMessage } from "@/types/messages";
import { getMessages, getMessage } from "@/actions/messages.actions";
import { QueryParams } from "@/types/common";
import { EMPTY_PAGINATED_RESPONSE } from "@/constants";

/**
 * Fetches all messages for the current user.
 *
 * This custom hook retrieves the user ID from the user store and uses React Query to fetch messages.
 * The query is enabled only if a valid user ID is available. It accepts optional query parameters via the
 * `params` argument, which are passed to the `getMessages` function to customize the data fetching behavior.
 * On failure, a toast notification is displayed and an empty paginated response is returned.
 *
 * @param params - Optional query parameters to filter or modify the messages request. Defaults to an empty object.
 * @returns A React Query result containing the messages data on success, or an empty paginated response on failure.
 *
 * @example
 * const { data, error, isLoading } = useMessagesQuery({ limit: 20 });
 */
export function useMessagesQuery(params: QueryParams = {}) {
  const { userId } = useUserStore();
  
  return useQuery({
    enabled: !!userId,
    queryKey: ["messages:all", params],
    queryFn: async () => {
      const response = await getMessages(userId as string, params);
      if (!response.success) {
        useToast({
          type: "error",
          message: response.message as string,
          title: "Error fetching messages",
        });
        return EMPTY_PAGINATED_RESPONSE;
      }
      return response.data;
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
      const response = await getClerkUserImageUrl(clerkId as string);
      return response.data;
    },
  });
}

