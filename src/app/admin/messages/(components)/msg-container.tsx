"use client";

import { useCallback, useMemo, useState } from "react";
import { SearchIcon } from "lucide-react";
import { IoMdRefresh } from "react-icons/io";
import { useDebounce } from 'use-debounce';
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
import { Pagination } from "@/components/ui/pagination";

const ITEMS_PER_PAGE = 20;

export default function MessagesContainer() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState<ExtendedMessage | null>(null);

  const queryParams = useMemo(() => {
    const params: QueryParams = {
      take: ITEMS_PER_PAGE,
      page: currentPage,
      where: {
        isSentByAdmin: activeTab === "sent",
        ...(showUnreadOnly ? { isRead: false } : {}),
      },
    };

    if (debouncedSearch) {
      params.where = {
        ...params.where,
        OR: [
          { subject: { contains: debouncedSearch, mode: 'insensitive' } },
          { message: { contains: debouncedSearch, mode: 'insensitive' } },
          { email: { contains: debouncedSearch, mode: 'insensitive' } }
        ]
      };
    }

    return params;
  }, [currentPage, debouncedSearch, showUnreadOnly, activeTab]);

  const { data, isPending, refetch, isRefetching } = useMessagesQuery(queryParams);
  const messages = data?.data ?? [];
  const metadata = data?.metadata;
  const total = metadata?.total ?? 0;
  const lastPage = metadata?.lastPage ?? 1;

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

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const counts = useMemo(() => ({
    inbox: messages?.filter(m => !m.isSentByAdmin).length ?? 0,
    sent: messages?.filter(m => m.isSentByAdmin).length ?? 0,
  }), [messages]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleTabChange = (tab: "inbox" | "sent") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleUnreadChange = (checked: boolean) => {
    setShowUnreadOnly(checked);
    setCurrentPage(1);
  };

  return (
    <div className="grid h-[calc(100vh-8rem)] grid-cols-1 gap-8 md:grid-cols-2">
      <div className="overflow-y-auto pb-6">
        <div className="sticky top-0 z-10 mb-4 bg-white pb-4 shadow-lg">
          <MessageTabs 
            activeTab={activeTab} 
            onTabChange={handleTabChange}
            inboxCount={counts.inbox}
            sentCount={counts.sent}
            handleMessageSelect={setSelectedMessage}
          />
          <div className="mb-4 flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2">
              <Switch 
                className="border ring-neutral-7" 
                id="unread-filter" 
                checked={showUnreadOnly} 
                onCheckedChange={handleUnreadChange} 
              />
              <Label htmlFor="unread-filter">Show unread only</Label>
            </div>
            <div className="flex items-center gap-2">
              <ComposeEmail />
              <Button 
                disabled={isRefetching} 
                className={cn(isRefetching && "bg-neutral-6", 'active:bg-slate-500')} 
                onClick={handleRefresh} 
                variant='outline'
              >
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
              onChange={handleSearchChange}
            />
          </div>
        </div>
        
        {isPending ? (
          <MessageSkeleton />
        ) : (
          <>
            {activeTab === "inbox" ? (
              <MessageList
                messages={messages}
                onSelectMessage={handleMessageSelect}
                selectedMessageId={selectedMessage?.id}
              />
            ) : (
              <SentMessageList
                messages={messages}
                onSelectMessage={handleMessageSelect}
                selectedMessageId={selectedMessage?.id}
              />
            )}
          </>
        )}

        {!isPending && total > 0 && (
          <div className="mt-4 flex items-center justify-between px-2">
            <div className="text-muted-foreground text-sm">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
              {Math.min(currentPage * ITEMS_PER_PAGE, total)} of {total} entries
            </div>
            <Pagination
              page={currentPage}
              total={lastPage}
              onChange={setCurrentPage}
              hasNextPage={currentPage < lastPage}
              hasPrevPage={currentPage > 1}
            />
          </div>
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


