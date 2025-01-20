'use client';

import PageAnimation from "@/components/public/page-animation";
import PageTitle from "@/components/public/page-title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/text-area";

const ContactPage = () => {
  return (
    <PageAnimation className='max-w-4xl'>
      <PageTitle 
        title="Contact Us" 
        description="Got a technical issue? Want to send feedback about a beta feature? Need details about our Business plan? Let us know." />
      <form className="flex w-full flex-col space-y-4 pt-8" aria-labelledby="contact-form-header">
        <div className="space-y-2">
          <label htmlFor="email" className="block font-medium">
              Your email
          </label>
          <Input 
            id="email" 
            placeholder="name@merchtrack.com" 
            type="email"
            aria-label="Your email address"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="subject" className="block font-medium">
              Subject
          </label>
          <Input 
            id="subject" 
            placeholder="Let us know how we can help you"
            aria-label="Subject of your message"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="message" className="block font-medium ">
              Message
          </label>
          <TextArea id="message" placeholder="Write your message here..." />
        </div>
        <Button className="ml-auto w-full text-neutral-1 sm:w-auto">Send message</Button>
      </form>
    </PageAnimation>
  );
};

export default ContactPage;

