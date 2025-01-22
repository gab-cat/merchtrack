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


const ContactForm = ({ contactMessage }: {contactMessage: FormContactType}) => {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormContactType>({
    mode: "onBlur",
    resolver: zodResolver(formContactSchema),
    defaultValues: {...contactMessage}
  });

  useEffect(() => {
    localStorage.setItem('contactMessage', form.formState.isDirty.toString());
  }, [form.formState.isDirty]);

  async function onSubmit(data: FormContactType) {
    setLoading(true);
    try {
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const result = await submitMessage(data);
      form.reset(data);
    }
    catch (error) {
      console.log(error);
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
        <div className="space-y-2">
          <label htmlFor="email" className="block font-medium">
            Your email
          </label>
          <Input
            id="email"
            placeholder="name@merchtrack.com"
            {...form.register("email")}
          />
          {form.formState.errors.email && <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="subject" className="block font-medium">
            Subject
          </label>
          <Input
            id="subject"
            placeholder="Let us know how we can help you"
            {...form.register("subject")}
          />
          {form.formState.errors.subject && <div className="text-sm text-red-500 ">{form.formState.errors.subject.message}</div>}
        </div>
        <div className="space-y-2">
          <label htmlFor="message" className="block font-medium">
            Message
          </label>
          <TextArea
            id="message"
            placeholder="Write your message here..."
            {...form.register("message")}
          />
          {form.formState.errors.message && <p className="text-sm text-red-500">{form.formState.errors.message.message}</p>}
        </div>
        <Button disabled={loading} className={cn("ml-auto w-full text-neutral-1 sm:w-auto", loading ? 'bg-primary-700' : 'bg-primary-500')} type="submit">
          {loading ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </Form>
  );
};

export default ContactForm;