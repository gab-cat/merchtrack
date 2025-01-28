"use client";

import { useCallback, useState } from "react";
import { SearchIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { IoMdRefresh } from "react-icons/io";
import MessageList from "./msg-list";
import MessageDetail from "./msg-detail";
import MessageSkeleton from "./msg-skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ExtendedMessage } from "@/types/messages";
import { getMessages } from "@/app/admin/messages/_actions";
import { useUserStore } from "@/stores/user.store";
import useToast from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function MessagesContainer() {
  const { userId } = useUserStore();
  const { data: messages, isPending, refetch } = useQuery({
    queryKey: ["messages"],
    queryFn: async () => {
      const response = await getMessages(userId as string);
      if (!response.success) {
        useToast({
          type: "error",
          message: response.message as string,
          title: "Error fetching messages",
        });
      }
      return response.data;
    },
  });
  const [selectedMessage, setSelectedMessage] = useState<ExtendedMessage | null>(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleMessageSelect = (message: ExtendedMessage) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      messages?.map((m) => (m.id === message.id ? { ...m, isRead: true } : m));
    }
  };

  const selectedMessageReply = messages?.find(m => m.repliesToId === selectedMessage?.id) as ExtendedMessage | undefined;

  const handleReply = () => {
    if (selectedMessage) {
      setSelectedMessage(null);
    }
    refetch();
  };

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [isPending]);

  const filteredMessages = messages?.filter(
    (message) =>
      (!showUnreadOnly || !message.isRead) &&
      (message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.message.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div>
        <div className="mb-4 flex items-center justify-between space-x-2">
          <div className="flex items-center space-x-2">
            <Switch className="border ring-neutral-7" id="unread-filter" checked={showUnreadOnly} onCheckedChange={setShowUnreadOnly} />
            <Label htmlFor="unread-filter">Show unread only</Label>
            <span className="text-sm text-gray-500">Total messages: {messages?.length ?? 0}</span>
          </div>
          <div>
            <Button disabled={isPending} className={cn(isPending && "bg-neutral-6", 'active:bg-slate-500')} onClick={handleRefresh} variant='outline'>
              <IoMdRefresh className={cn("mr-2", isPending && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>
        <div className="mb-4 flex items-center space-x-2">
          <SearchIcon className="" />
          <Input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {isPending ? (
          <MessageSkeleton />
        ) : (
          <MessageList
            messages={filteredMessages as ExtendedMessage[]}
            onSelectMessage={handleMessageSelect}
            selectedMessageId={selectedMessage?.id}
          />
        )}
      </div>
      <div>
        {selectedMessage ? (
          <MessageDetail message={selectedMessage} replyMessage={selectedMessageReply} onReply={handleReply} />
        ) : (
          <div className="mt-8 text-center text-gray-500">Select a message to view details</div>
        )}
      </div>
    </div>
  );
}

