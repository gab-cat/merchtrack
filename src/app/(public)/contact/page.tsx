'use client';

import { useActionState, useEffect } from "react"; // Use useActionState
import { submitMessage } from "@/actions/public.actions";
import PageAnimation from "@/components/public/page-animation";
import PageTitle from "@/components/public/page-title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/text-area";
import { useToast } from "@/hooks/use-toast";

const ContactPage = () => {
  // Use useActionState to handle form state and submission
  const [state, formAction, isPending] = useActionState(submitMessage, null);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.message) {
      toast({
        title: "Message Sent!",
        description: state.message,
      });
    }
  }, [state, toast]);
  return (
    <PageAnimation className="max-w-4xl">
      <PageTitle
        title="Contact Us"
        description="Got a technical issue? Want to send feedback about a beta feature? Need details about our Business plan? Let us know."
      />
      <form
        className="mb-4 flex w-full flex-col space-y-4 pt-8"
        action={formAction} // Use action prop for form submission
      >
        <div className="space-y-2">
          <label htmlFor="email" className="block font-medium">
            Your email
          </label>
          <Input
            id="email"
            name="email"
            placeholder="name@merchtrack.com"
            defaultValue={state?.prevData?.email || ""} // Repopulate the email field
          />
          {state?.errors?.email && <p className="text-red-500">{state.errors.email}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="subject" className="block font-medium">
            Subject
          </label>
          <Input
            id="subject"
            name="subject"
            placeholder="Let us know how we can help you"
            defaultValue={state?.prevData?.subject || ""} // Repopulate the subject field
          />
          {state?.errors?.subject && <p className="text-red-500">{state.errors.subject}</p>}
        </div>
        <div className="space-y-2">
          <label htmlFor="message" className="block font-medium">
            Message
          </label>
          <TextArea
            id="message"
            name="message"
            placeholder="Write your message here..."
            defaultValue={state?.prevData?.message || ""} // Repopulate the message field
          />
          {state?.errors?.message && <p className="text-red-500">{state.errors.message}</p>}
        </div>
        <Button className="ml-auto w-full text-neutral-1 sm:w-auto" type="submit" disabled={isPending}>
          {isPending ? "Sending..." : "Send message"}
        </Button>
      </form>
    </PageAnimation>
  );
};

export default ContactPage;