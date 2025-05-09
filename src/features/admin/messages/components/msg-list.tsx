import { useMemo, useCallback } from "react";
import { MdMarkEmailRead, MdArchive, MdOutlineMarkChatRead, MdOutlineEmail } from "react-icons/md";
import { IoMailUnreadOutline } from "react-icons/io5";
import { useAutoAnimate } from '@formkit/auto-animate/react';
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
  const customerMessages = useMemo(() => messages?.filter(message => message.isSentByCustomer), [messages]);
  const groupedMessages = useMemo(() => groupMessages(customerMessages!), [customerMessages]);
  const [ parent ] = useAutoAnimate();
  const handleSelectMessage = useCallback((message: ExtendedMessage) => {
    onSelectMessage(message);
  }, [onSelectMessage]);

  if (!messages) {
    return (
      <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border border-dashed">
        <MdOutlineEmail className="mb-2 size-10 text-gray-400" />
        <p className="text-center text-gray-500">No messages found.</p>
      </div>
    );
  }



  return (
    <PageAnimation className="space-y-4">
      <ul className="list-none" ref={parent}>
        {Object.entries(groupedMessages).map(([customerId, customerMessages]) => (
          <div key={customerId} className="my-2 rounded-lg border p-4">
            <div className="mb-2 flex items-center">
              <h3 className="text-sm font-medium">
                <span className="mr-1 text-gray-600">From:</span> 
                <span className="font-semibold text-primary">{customerMessages[0].user ? `${customerMessages[0].user.firstName} ${customerMessages[0].user.lastName}` : customerMessages[0].email}</span>
              </h3>
            </div>
            <ul className="list-none" ref={parent}>
              {customerMessages.map((message) => (
                <div key={message.id} className="mb-2 flex items-center">
                  <Button
                    variant={message.id === selectedMessageId ? "default" : "ghost"}
                    className={cn(message.isRead && 'font-bold', message.id === selectedMessageId && 'bg-primary-100 border-primary', 'w-full justify-start text-left p-4 py-8 border hover:bg-primary-200')}
                    onClick={() => handleSelectMessage(message)}
                  >
                    <div className="w-full truncate py-2">
                      <div className="flex items-center text-base font-semibold text-neutral-7">
                        {message.isRead ? (<MdOutlineMarkChatRead className="mr-4 size-2 text-green-500"/>) : (<IoMailUnreadOutline className="mr-4 size-2 text-red-500"/>)}
                        {message.subject}
                      </div>
                      <div className="flex w-full content-center items-center justify-between">
                        <p className="pl-8 pt-2 text-xs font-normal text-gray-500">{message.message}</p>
                        <p className="pl-8 text-xs font-medium text-gray-500">{manilaTime.dateTime(message.createdAt)}</p>
                      </div>
                      
                      
                    </div>
                  </Button>
                  <div className="ml-2 flex items-center space-x-2">
                    <MdMarkEmailRead className="cursor-pointer text-gray-500 hover:text-primary" />
                    <MdArchive className="cursor-pointer text-gray-500 hover:text-primary" />
                  </div>
                </div>
              ))}
            </ul>
          </div>
        ))}
      </ul>
    </PageAnimation>
  );
}

function groupMessages(customerMessages: ExtendedMessage[]) {
  return customerMessages.reduce(
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
}

