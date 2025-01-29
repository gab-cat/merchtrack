import { useCallback } from "react";
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { MdOutlineEmail } from "react-icons/md";
import { IoMailOutline } from "react-icons/io5";
import { ExtendedMessage } from "@/types/messages";
import { Button } from "@/components/ui/button";
import { manilaTime } from "@/utils/formatTime";
import PageAnimation from "@/components/public/page-animation";
import { cn } from "@/lib/utils";

interface SentMessageListProps {
  messages: ExtendedMessage[] | undefined;
  onSelectMessage: (message: ExtendedMessage) => void;
  selectedMessageId: string | undefined;
}

export default function SentMessageList({ messages, onSelectMessage, selectedMessageId }: Readonly<SentMessageListProps>) {
  const [parent] = useAutoAnimate();
  
  const handleSelectMessage = useCallback((message: ExtendedMessage) => {
    onSelectMessage(message);
  }, [onSelectMessage]);

  if (!messages?.length) {
    return (
      <div className="flex h-[200px] flex-col items-center justify-center rounded-lg border border-dashed">
        <MdOutlineEmail className="mb-2 size-10 text-gray-400" />
        <p className="text-center text-gray-500">No sent messages found.</p>
      </div>
    );
  }

  return (
    <PageAnimation className="space-y-4">
      <ul className="list-none space-y-3" ref={parent}>
        {messages.map((message) => (
          <li key={message.id}>
            <Button
              variant={message.id === selectedMessageId ? "default" : "ghost"}
              className={cn(
                'group relative w-full min-w-max h-full hover:bg-primary-200 overflow-hidden rounded-lg border p-4 transition-all hover:border-primary hover:shadow-md',
                message.id === selectedMessageId && 'border-primary bg-primary/5',
                'flex flex-col items-start gap-2'
              )}
              onClick={() => handleSelectMessage(message)}
            >
              <div className="absolute right-2 top-2">
                <IoMailOutline className="size-5 text-gray-400 group-hover:text-primary" />
              </div>
              
              <div className="flex w-full flex-col text-left">
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    To: <span className="text-primary">{message.email}</span>
                  </span>
                  <span className="text-xs text-gray-500">{manilaTime.dateTime(message.createdAt)}</span>
                </div>
                
                <h3 className="mb-1 text-base font-semibold tracking-tight">
                  {message.subject}
                </h3>
                
                <p className="line-clamp-2 text-sm font-normal text-gray-500">
                  {message.message}
                </p>
              </div>
              
              <div className="mt-2 flex w-full items-center justify-between border-t pt-2 text-xs text-gray-500">
                <span>
                  Replied Staff: <span className="font-medium">{message.user?.firstName} {message.user?.lastName}</span>
                </span>
                {message.isRead && <span className="text-green-600">Read</span>}
              </div>
            </Button>
          </li>
        ))}
      </ul>
    </PageAnimation>
  );
}
