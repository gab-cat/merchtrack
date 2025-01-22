'use client';

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/text-area";
import { formContactSchema, FormContactType } from "@/schema/public-contact";
import { submitMessage } from "@/actions/public.actions";
import { Form } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import useToast from "@/hooks/use-toast";

const contactMessage = {
  email: '',
  subject: '',
  message: '',
};

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
  const [loading, setLoading] = useState(false);

  const form = useForm<FormContactType>({
    mode: "onBlur",
    resolver: zodResolver(formContactSchema),
    defaultValues: {...contactMessage}
  });

  useEffect(() => {
    if (form.formState.isDirty) {
      localStorage.setItem('contactMessage', JSON.stringify({
        email: form.getValues('email'),
        subject: form.getValues('subject'),
        message: form.getValues('message'),
      }));
    }
  }, [form.formState.isDirty]);

  async function onSubmit(data: FormContactType) {
    setLoading(true);
    try {
      const result = await submitMessage(data);
      form.reset({ email: '', subject: '', message: '' });
      localStorage.removeItem('contactMessage');
      useToast({
        title: result.success ? "Success" : "Error",
        message: result.message as string,
        type: result.success ? "success" : "error",
      });
    }
    catch (error) {
      useToast({
        title: "Your message could not be sent",
        message: (error as Error).message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }
  return (
    <Form {...form}>
      <form
        className="mb-4 flex w-full flex-col space-y-4 pt-8 font-inter"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {formFields.map((field) => (
          <div key={field.id} className="space-y-2">
            <label htmlFor={field.id} className="block font-medium">
              {field.label}
            </label>
            {field.type === 'textarea' ? (
              <TextArea
                id={field.id}
                placeholder={field.placeholder}
                {...form.register(field.id as keyof FormContactType)}
              />
            ) : (
              <Input
                id={field.id}
                placeholder={field.placeholder}
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
          disabled={loading} 
          className={cn("ml-auto w-full text-neutral-1 sm:w-auto", loading ? 'bg-primary-700' : 'bg-primary-500')} 
          type="submit"
          aria-label="Send contact form message"
        >
          {loading ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </Form>
  );
};

export default ContactForm;