'use client';

import { useState } from "react";
import { MdOutlineEmail } from "react-icons/md";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoIosSend } from "react-icons/io";
import { RiMailSendFill } from "react-icons/ri";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createMessageSchema, CreateMessageType } from "@/schema/messages";
import { Form } from "@/components/ui/form";
import useToast from "@/hooks/use-toast";
import { createMessage } from "@/app/admin/messages/_actions";
import { useUserStore } from "@/stores/user.store";
import { cn } from "@/lib/utils";


const formFields = [
  {
    id: "email",
    label: "To",
    type: "email",
    placeholder: "recipient@example.com",
    component: Input,
  },
  {
    id: "subject",
    label: "Subject",
    type: "text",
    placeholder: "Enter subject",
    component: Input,
  },
  {
    id: "message",
    label: "Message",
    type: "text",
    placeholder: "Type your message here...",
    component: Textarea,
    className: "h-[200px]",
  },
  {
    id: "customerName",
    label: "Customer Name",
    type: "text",
    placeholder: "Enter customer name",
    component: Input,
  },
];


export default function ComposeEmail() {

  const { userId } = useUserStore();

  const [open, setOpen] = useState(false);
  const form = useForm({
    reValidateMode: "onBlur",
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      email: "",
      subject: "",
      message: "",
      customerName: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateMessageType) => createMessage({
      userId: userId as string,
      formData: data
    }),
    mutationKey: ["messages:all"],
    onSuccess: () => {
      form.reset();
      setOpen(false);
      useToast({
        type: "success",
        message: "Your email has been sent successfully.",
        title: "Email sent",
      });
    },
    onError: (error) => {
      useToast({
        type: "error",
        message: error.message,
        title: 'Error sending email',
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="text-white">
          <MdOutlineEmail className="mr-2" />
          Compose
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-neutral-2 sm:max-w-[525px]">
        <Form {...form}>
          <DialogHeader>
            <DialogTitle className="flex items-center font-bold text-primary"><RiMailSendFill className="mr-2"/>Compose New Email</DialogTitle>
          </DialogHeader>
          <form 
            onSubmit={form.handleSubmit((data) => mutate(data))} 
            className="space-y-4"
          >
            {formFields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id} className="flex items-center">{field.label}</Label>
                <field.component
                  id={field.id}
                  type={field.type}
                  placeholder={field.placeholder}
                  className={field.className}
                  required
                  disabled={isPending}
                  {...form.register(field.id as keyof CreateMessageType)}
                />
              </div>
            ))}
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className={cn('text-white', isPending && 'bg-gray-400')}
                disabled={isPending || Object.keys(form.formState.errors).length > 0}
              >
                {isPending ? (
                  <AiOutlineLoading3Quarters className="size-5 animate-spin" />
                ) : (
                  <IoIosSend className="size-5" />
                )}
                {isPending ? "Sending..." : "Send Email"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
