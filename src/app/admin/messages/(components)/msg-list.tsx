import { MdMarkEmailRead, MdArchive, MdOutlineMarkChatRead } from "react-icons/md";
import { IoMailUnreadOutline } from "react-icons/io5";

import { ExtendedMessage } from "@/types/messages";
import { Button } from "@/components/ui/button";
import { manilaTime } from "@/utils/formatTime";
import PageAnimation from "@/components/public/page-animation";
import { cn } from "@/lib/utils";

interface MessageListProps {
  messages: ExtendedMessage[] | undefined;
  onSelectMessage: (message: ExtendedMessage) => void;
  selectedMessageId: string | undefined;
}

export default function MessageList({ messages, onSelectMessage, selectedMessageId }: Readonly<MessageListProps>) {
  if (!messages) {
    return <div>No messages available.</div>;
  }

  const customerMessages = messages.filter(message => message.isSentByCustomer);

  const groupedMessages = customerMessages.reduce(
    (acc, message) => {
      if (message.repliesToId) return acc; // Exclude messages that are replies

      const userId = message.user ? message.user.id : message.email;
      if (!acc[userId]) {
        acc[userId] = [];
      }
      acc[userId].push(message);
      return acc;
    },
    {} as Record<string, ExtendedMessage[]>,
  );

  return (
    <PageAnimation className="space-y-4">
      {Object.entries(groupedMessages).map(([customerId, customerMessages]) => (
        <div key={customerId} className="rounded-lg border p-4">
          <div className="mb-2 flex items-center">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-white">
              {customerMessages[0].email[0].toLocaleUpperCase()}
            </div>
            <h3 className="ml-4 font-semibold">
              {customerMessages[0].user ? `${customerMessages[0].user.firstName} ${customerMessages[0].user.lastName}` : customerMessages[0].email}
            </h3>
          </div>
          {customerMessages.map((message) => (
            <div key={message.id} className="mb-2 flex items-center">
              <Button
                variant={message.id === selectedMessageId ? "default" : "ghost"}
                className={cn(message.isRead && 'font-bold', message.id === selectedMessageId && 'bg-primary-200', 'w-full justify-start text-left p-4 py-8 border hover:bg-primary-200')}
                onClick={() => onSelectMessage(message)}
              >
                <div className="truncate">
                  <div className="flex items-center text-base font-semibold">
                    {message.isRead ? (<MdOutlineMarkChatRead className="mr-4 size-2 text-green-500"/>) : (<IoMailUnreadOutline className="mr-4 size-2 text-red-500"/>)}
                    {message.subject}
                  </div>
                  <div className="pl-8 text-sm text-gray-500">{manilaTime.dateTime(message.createdAt)}</div>
                </div>
              </Button>
              <div className="ml-2 flex items-center space-x-2">
                <MdMarkEmailRead className="cursor-pointer text-gray-500 hover:text-primary" />
                <MdArchive className="cursor-pointer text-gray-500 hover:text-primary" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </PageAnimation>
  );
}

