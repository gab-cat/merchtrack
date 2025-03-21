'use client';

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import MessageHeaderContent from "./msg-detail-header-content";
import MessageReply from "./msg-detail-reply";
import MessageReplyForm from "./msg-detail-replyform";
import MessageOriginalSkeleton from "./msg-original-skeleton";
import type { ExtendedMessage } from "@/types/messages";
import { useMessageQuery } from "@/hooks/messages.hooks";

interface MessageDetailProps {
  message: ExtendedMessage
  replyMessage?: ExtendedMessage
  onReply: () => void
  mode: "inbox" | "sent"
}

export default function MessageDetail({ message, replyMessage, onReply, mode }: Readonly<MessageDetailProps>) {
  const [key, setKey] = useState(0);

  const { data: originalMessage, isLoading } = useMessageQuery(
    message.repliesToId,
    mode === "sent" as const
  );

  useEffect(() => {
    setKey((prevKey) => prevKey + 1);
  }, [message]);

  return (
    <motion.div
      key={key}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 rounded-2xl border border-gray-200 bg-white p-6  dark:border-gray-700 dark:bg-gray-800"
    >
      <MessageHeaderContent message={message} mode={mode} />
      
      {mode === "inbox" ? (
        replyMessage ? (
          <MessageReply replyMessage={replyMessage}/>
        ) : (
          <MessageReplyForm messageId={message.id} onSuccess={onReply} />
        )
      ) : null}

      {mode === "sent" && message.repliesToId && (
        <>
          <div className="my-6 border-t border-gray-200" />
          <div className="mt-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-600">Original Message</h3>
            {isLoading ? (
              <MessageOriginalSkeleton />
            ) : originalMessage ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                layout={false}
              >
                <MessageHeaderContent message={originalMessage} mode={mode}/>
              </motion.div>
            ) : null}
          </div>
        </>
      )}
    </motion.div>
  );
}

