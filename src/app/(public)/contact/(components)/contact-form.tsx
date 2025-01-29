'use client';

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { IoIosSend } from "react-icons/io";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/text-area";
import { formContactSchema, FormContactType } from "@/schema/public-contact";
import { submitMessage } from "@/actions/public.actions";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import useToast from "@/hooks/use-toast";

const formFields = [
  {
    id: 'email',
    label: 'Your email',
    placeholder: 'name@merchtrack.tech',
    type: 'input'
  },
  {
    id: 'subject',
    label: 'Subject',
    placeholder: 'Let us know how we can help you',
    type: 'input'
  },
  {
    id: 'message',
    label: 'Message',
    placeholder: 'Write your message here...',
    type: 'textarea'
  }
] as const;

const ContactForm = () => {
  const form = useForm<FormContactType>({
    mode: "onBlur",
    resolver: zodResolver(formContactSchema),
    defaultValues: {
      email: '',
      subject: '',
      message: '',
    }
  });

  const mutation = useMutation({
    mutationFn: (formData: FormContactType) => submitMessage(formData),
    onSuccess: () => {
      form.reset();
      useToast({
        type: 'success',
        message: 'Keep an eye on your inbox for a response. We will get back to you within 24 hours. Thank you!',
        title: 'Message sent successfully',
        duration: 10
      });
    },
    onError: () => {
      useToast({
        type: 'error',
        message: 'An error occurred while sending the message. Please try again later.',
        title: 'Error'
      });
    }
  });

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (form.formState.isDirty) {
        event.preventDefault();
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [form.formState.isDirty]);

  return (
    <Form {...form}>
      <form
        className="mb-4 flex w-full flex-col space-y-4 pt-8 font-inter"
        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
      >
        {formFields.map((field) => (
          <div key={field.id} className="space-y-2">
            <label htmlFor={field.id} className="block font-medium">
              {field.label}
            </label>
            {field.type === 'textarea' ? (
              <TextArea
                id={field.id}
                disabled={mutation.isPending}
                placeholder={field.placeholder}
                {...form.register(field.id as keyof FormContactType)}
              />
            ) : (
              <Input
                id={field.id}
                placeholder={field.placeholder}
                disabled={mutation.isPending}
                {...form.register(field.id as keyof FormContactType)}
              />
            )}
            {form.formState.errors[field.id as keyof FormContactType] && (
              <p className="text-sm text-red-500">
                {form.formState.errors[field.id as keyof FormContactType]?.message}
              </p>
            )}
          </div>
        ))}
        <Button 
          disabled={mutation.isPending} 
          aria-busy={mutation.isPending}
          className={cn("ml-auto w-full text-neutral-1 sm:w-auto", mutation.isPending ? 'bg-primary-700' : 'bg-primary-500')} 
          type="submit"
          aria-label="Send contact form message"
        >
          {mutation.isPending ? (
            <AiOutlineLoading3Quarters className="size-5 animate-spin" />
          ) : (
            <IoIosSend className="size-5" />
          )}
          {mutation.isPending ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </Form>
  );
};

export default ContactForm;