import { MdOutlineEmail } from "react-icons/md";
import { CiCalendar } from "react-icons/ci";
import { manilaTime } from "@/utils/formatTime";
import type { ExtendedMessage } from "@/types/messages";
import { MessageDetailReply } from "@/features/admin/messages/components";

interface MessageHeaderContentProps {
  message: ExtendedMessage
  mode: "inbox" | "sent"
}

export default function MessageHeaderContent({ message, mode }: Readonly<MessageHeaderContentProps>) {
  return (
    <>
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{message.subject}</h2>
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center">
            <MdOutlineEmail className="mr-2 size-4" />
            {message.email}
          </span>
          <span className="flex items-center">
            <CiCalendar className="mr-2 size-4" />
            {manilaTime.dateTime(message.createdAt)}
          </span>
        </div>
      </div>

      { mode === "inbox" ? (
        <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
          <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{message.message}</p>
        </div>
      ): (
        <MessageDetailReply replyMessage={message}/>
      )}
    </>
  );
}
