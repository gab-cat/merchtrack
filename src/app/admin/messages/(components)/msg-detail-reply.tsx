import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { manilaTime } from "@/utils/formatTime";
import type { ExtendedMessage } from "@/types/messages";
import { getClerkUserImageUrl } from "@/actions/users.action";

interface MessageReplyProps {
  replyMessage: ExtendedMessage;
}

export default function MessageReply({ replyMessage }: Readonly<MessageReplyProps>) {
  const { data: userData } = useQuery({
    enabled: replyMessage.user?.clerkId !== undefined,
    queryKey: [`users:${replyMessage.user?.clerkId}`],
    queryFn: async () => {
      const response = await getClerkUserImageUrl(replyMessage.user?.clerkId as string);
      return response.data;
    },
  });
  return (
    <div className="my-2 space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-700">
      <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Reply</h3>
      <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{replyMessage.message}</div>
      { replyMessage.user && (
        <div className="rounded-md bg-white p-4 shadow-sm dark:bg-gray-600">
          <div className="flex items-center space-x-4">
            <div className="">
              { !userData ?      (<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-semibold leading-tight tracking-tighter text-white">
                {replyMessage.user?.firstName?.[0]?.toUpperCase() ?? ''} {replyMessage.user?.lastName?.[0]?.toUpperCase() ?? ''}
              </div>)
                :
                (<Image
                  className="aspect-square size-12 rounded-full bg-primary-200 object-cover"
                  src={userData}
                  width={48}
                  height={48}
                  alt={`${replyMessage.user?.firstName} ${replyMessage.user?.lastName}`}
                />)}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {replyMessage.user?.firstName} {replyMessage.user?.lastName}
              </p>
              <p className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">{replyMessage.user?.email}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {manilaTime.dateTime(replyMessage.createdAt)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
