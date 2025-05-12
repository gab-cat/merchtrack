'use client';

import { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from 'sonner';
import { Loader2 } from "lucide-react";
import { useMutation } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createTicket } from "@/features/customer/tickets/actions";
import { useUserStore } from '@/stores/user.store';

const supportFormSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type SupportFormValues = z.infer<typeof supportFormSchema>;

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  predefinedSubject?: string;
  predefinedTemplate?: string;
}

export default function SupportModal({ 
  isOpen, 
  onClose, 
  predefinedSubject = "Account Change Request",
  predefinedTemplate = "I would like to request the following changes to my account: \n\n[Please describe the changes you need]\n\nThank you."
}: Readonly<SupportModalProps>) {
  const { user } = useUserStore();

  const form = useForm<SupportFormValues>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      email: user?.email ?? "",
      subject: predefinedSubject,
      message: predefinedTemplate,
    },
  });

  useEffect(() => {
    if (user?.email) {
      form.setValue("email", user.email);
    }
  }, [user, form]);

  // Ticket creation mutation
  const ticketCreateMutation = useMutation({
    mutationFn: createTicket,
    onSuccess: (data) => {
      if (!data.success) {
        throw new Error(data.message ?? 'Failed to create ticket');
      }
      toast.success("Ticket created successfully");
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast.error("Failed to create support ticket. Support has been notified via email.");
      console.error("Ticket creation error:", error);
    }
  });

  const onSubmit = (values: SupportFormValues) => {
    try {
      // If the message was sent successfully, create a ticket if the user is logged in
      if (user?.id) {
        ticketCreateMutation.mutate({
          title: values.subject,
          description: values.message,
          priority: "MEDIUM",
          createdById: user.id,
        });
      }
    } catch (error) {
      console.error("Support form submission error:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Contact Support</DialogTitle>
          <DialogDescription>
            Fill out the form below to contact our support team for account changes.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your.email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Please describe what changes you need for your account..." 
                      className="h-32" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={ticketCreateMutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={ticketCreateMutation.isPending}>
                {ticketCreateMutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                {ticketCreateMutation.isPending ? "Submitting..." : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}