import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoIosSend, IoMdAlert } from "react-icons/io";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form } from "@/components/ui/form";
import { replyMessageSchema } from "@/features/admin/messages/messages.schema";
import { replyToMessage } from "@/features/admin/messages/actions";
import { useUserStore } from "@/stores/user.store";
import useToast from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

interface MessageReplyFormProps {
  messageId: string;
  onSuccess: () => void;
}

export default function MessageReplyForm({ messageId, onSuccess }: Readonly<MessageReplyFormProps>) {
  const { userId } = useUserStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
        messageId,
        reply,
      }),
    mutationKey: ['messages:all'],
    onSuccess: () => {
      form.reset();
      useToast({
        type: "success",
        message: "Your reply has been sent successfully.",
        title: "Reply sent",
      });
      onSuccess();
    },
    onError: () => {
      useToast({
        type: "error",
        message: "An error occurred while sending your reply. Please try again.",
        title: "Reply failed",
      });
    },
  });

  const onSubmit = (data: { reply: string }) => {
    mutate(data);
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Reply</h3>
          { form.formState.errors.reply && <span className="text-sm text-red-500">{form.formState.errors.reply.message}</span> }
          <Textarea
            placeholder="Type your reply here..."
            className="min-h-[120px] w-full rounded-lg border-gray-300 bg-white p-4 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500"
            {...form.register("reply")}
          />
          <div className="flex justify-end">
            <AlertDialogTrigger asChild>
              <Button
                type="button" 
                className={cn(
                  "flex items-center space-x-2 rounded-full px-6 py-3 text-base font-medium text-white transition-all duration-200 ease-in-out",
                  isPending
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                )}
                disabled={isPending}
              >
                {isPending ? (
                  <AiOutlineLoading3Quarters className="size-5 animate-spin" />
                ) : (
                  <IoIosSend className="size-5" />
                )}
                <span>{isPending ? "Sending..." : "Send Reply"}</span>
              </Button>
            </AlertDialogTrigger>
          </div>
        </form>
      </Form>
      <AlertDialogContent className="bg-neutral-2 font-poppins">
        <AlertDialogHeader>
          <AlertDialogTitle>
            <span className="flex items-center font-semibold tracking-tight">
              <IoMdAlert className="mr-2 size-6 text-yellow-500" />
              Are you sure?
            </span>
          </AlertDialogTitle>
          <AlertDialogDescription>
              Please confirm that you want to send this reply. Once sent, it cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="text-white">
          <Button variant='outline' className="text-neutral-7 transition-colors hover:bg-neutral-4" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setIsDialogOpen(false);
              form.handleSubmit(onSubmit)(); // Manually trigger form submission
            }}
          >
              Confirm
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}