'use client';

import { useQuery } from "@tanstack/react-query";
import { getClerkUserImageUrl } from "@/actions/users.action";
import useToast from "@/hooks/use-toast";
import { useUserStore } from "@/stores/user.store";
import type { ExtendedMessage } from "@/types/messages";
import { getMessages, getMessage } from "@/actions/messages.actions";
import { QueryParams } from "@/types/common";
import { EMPTY_PAGINATED_RESPONSE } from "@/constants";

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

