"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { SearchIcon } from "lucide-react";
import { IoMdRefresh } from "react-icons/io";
import MessageList from "./msg-list";
import MessageDetail from "./msg-detail";
import MessageSkeleton from "./msg-skeleton";
import ComposeEmail from "./compose-email";
import MessageTabs from "./msg-tabs";
import SentMessageList from "./sent-msg-list";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ExtendedMessage } from "@/types/messages";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMessagesQuery } from "@/hooks/messages.hooks";
import type { QueryParams } from "@/types/common";
import { PaginationNav } from "@/components/pagination-nav";

export default function MessagesContainer() {
  const [params, setParams] = useState<QueryParams>({
    page: 1,
    limit: 20
  });
  const { data, isPending, refetch, isRefetching } = useMessagesQuery(params);
  const messages: ExtendedMessage[] = data?.data ?? [];
  const { total, page, lastPage } = data?.metadata ?? {};

  const [selectedMessage, setSelectedMessage] = useState<ExtendedMessage | null>(null);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");


  const handleMessageSelect = useCallback((message: ExtendedMessage) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      messages?.map((m: ExtendedMessage) => (m.id === message.id ? { ...m, isRead: true } : m));
    }
  }, [messages]);

  const selectedMessageReply = useMemo(() => {
    return messages?.find(m => m.repliesToId === selectedMessage?.id);
  }, [messages, selectedMessage]);

  const handleReply = useCallback(async () => {
    if (selectedMessage) {
      setSelectedMessage(null);
    }
    await refetch();
  }, [selectedMessage, refetch]);

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const handlePageChange = useCallback((newPage: number) => {
    setParams(prev => ({ ...prev, page: newPage }));
  }, []);

  const filteredMessages = useMemo(() => {
    const tabFiltered = messages?.filter(message => 
      activeTab === "inbox" ? !message.isSentByAdmin : message.isSentByAdmin
    );

    return tabFiltered?.filter(
      (message) =>
        (!showUnreadOnly || !message.isRead) &&
        (message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          message.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
          message.email.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  }, [messages, showUnreadOnly, searchTerm, activeTab]);

  const counts = useMemo(() => ({
    inbox: messages?.filter(m => !m.isSentByAdmin).length ?? 0,
    sent: messages?.filter(m => m.isSentByAdmin).length ?? 0,
  }), [messages]);

  useEffect(() => {
    if (selectedMessage) {
      setSelectedMessage(messages?.find(m => m.id === selectedMessage.id) as ExtendedMessage || null);
    }
  }, [messages, selectedMessage]);

  return (
    <div className="grid h-[calc(100vh-8rem)] grid-cols-1 gap-8 md:grid-cols-2">
      <div className="overflow-y-auto pb-6">
        <div className="sticky top-0 z-10 mb-4 bg-white pb-4 shadow-lg">
          <MessageTabs 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            inboxCount={counts.inbox}
            sentCount={counts.sent}
            handleMessageSelect={setSelectedMessage}
          />
          <div className="mb-4 flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2">
              <Switch className="border  ring-neutral-7" id="unread-filter" checked={showUnreadOnly} onCheckedChange={setShowUnreadOnly} />
              <Label htmlFor="unread-filter">Show unread only</Label>
            </div>
            <div className="flex items-center gap-2">
              <ComposeEmail />
              <Button disabled={isRefetching} className={cn(isRefetching && "bg-neutral-6", 'active:bg-slate-500')} onClick={handleRefresh} variant='outline'>
                <IoMdRefresh className={cn("mr-2", isRefetching && "animate-spin")} />
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
        </div>
        {isPending ? (
          <MessageSkeleton />
        ) : (
          <>
            {activeTab === "inbox" ? (
              <MessageList
                messages={filteredMessages}
                onSelectMessage={handleMessageSelect}
                selectedMessageId={selectedMessage?.id}
              />
            ) : (
              <SentMessageList
                messages={filteredMessages}
                onSelectMessage={handleMessageSelect}
                selectedMessageId={selectedMessage?.id}
              />
            )}
            
          </>
        )}
        {!isPending && (
          <PaginationNav
            currentPage={page ?? 1}
            totalPages={lastPage ?? 1}
            totalItems={total}
            onPageChange={handlePageChange}
            disabled={isRefetching}
            className="mt-4"
          />
        )}
      </div>
      <div className="overflow-y-auto">
        {selectedMessage ? (
          <MessageDetail 
            message={selectedMessage} 
            replyMessage={selectedMessageReply} 
            onReply={handleReply}
            mode={activeTab}
          />
        ) : (
          <div className="mt-8 text-center text-gray-500">Select a message to view details</div>
        )}
      </div>
    </div>
  );
}


