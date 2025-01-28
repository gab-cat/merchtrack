"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoIosSend } from "react-icons/io";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { ExtendedMessage } from "@/types/messages";
import { manilaTime } from "@/utils/formatTime";
import { Form } from "@/components/ui/form";
import { replyMessageSchema } from "@/schema/messages";
import { replyToMessage } from "@/app/admin/messages/_actions";
import { useUserStore } from "@/stores/user.store";
import useToast from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface MessageDetailProps {
  message: ExtendedMessage
  replyMessage?: ExtendedMessage
  onReply: () => void
}

export default function MessageDetail({ message, replyMessage, onReply }: Readonly<MessageDetailProps>) {
  const { userId } = useUserStore();
  const [key, setKey] = useState(0);


  useEffect(() => {
    setKey((prevKey) => prevKey + 1);
  }, [userId]);

  const form = useForm({
    reValidateMode: "onBlur",
    resolver: zodResolver(replyMessageSchema),
    defaultValues: {
      reply: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: ({ reply }: { reply: string }) =>
      replyToMessage({
        userId: userId as string,
        messageId: message.id,
        reply,
      }),
    onSuccess: () => {
      form.reset();
      useToast({
        type: "success",
        message: "Your reply has been sent successfully.",
        title: "Reply sent",
      });
      onReply();
    },
    onError: () => {
      useToast({
        type: "error",
        message: "An error occurred while sending your reply. Please try again.",
        title: "Reply failed",
      });
    },
  });

  return (
    <Form {...form}>
      <motion.div
        key={key}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="sticky top-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800"
      >
        <motion.form layout={false} className="space-y-6" onSubmit={form.handleSubmit((data) => mutate(data))}>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{message.subject}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center">
                <svg
                  className="mr-2 size-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                {message.email}
              </span>
              <span className="flex items-center">
                <svg
                  className="mr-2 size-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {manilaTime.dateTime(message.createdAt)}
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{message.message}</p>
          </div>

          {replyMessage ? (
            <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-700">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Reply</h3>
              <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{replyMessage.message}</div>
              <div className="rounded-md bg-white p-4 shadow-sm dark:bg-gray-600">
                <p className="text-base text-gray-900 dark:text-white">
                  Sent by:{" "}
                  <b>
                    {replyMessage.user?.firstName} {replyMessage.user?.lastName}
                  </b>
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{replyMessage.user?.email}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {manilaTime.dateTime(replyMessage.createdAt)}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Reply</h3>
              <Textarea
                placeholder="Type your reply here..."
                className="min-h-[120px] w-full rounded-lg border-gray-300 bg-white p-4 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500"
                {...form.register("reply")}
              />
              <div className="flex justify-end">
                <Button
                  className={cn(
                    "flex items-center space-x-2 rounded-full px-6 py-3 text-base font-medium text-white transition-all duration-200 ease-in-out",
                    isPending
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  )}
                  disabled={isPending}
                  type="submit"
                >
                  {isPending ? (
                    <AiOutlineLoading3Quarters className="size-5 animate-spin" />
                  ) : (
                    <IoIosSend className="size-5" />
                  )}
                  <span>{isPending ? "Sending..." : "Send Reply"}</span>
                </Button>
              </div>
            </div>
          )}
        </motion.form>
      </motion.div>
    </Form>
  );
}

