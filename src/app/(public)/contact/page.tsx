'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TextArea } from "@/components/ui/text-area";

const ContactPage = () => {
  return (
    <div aria-label="Contact form section">
      <div className="container mx-auto max-w-2xl px-4 py-8 md:py-8">
        <div className="space-y-6">
          <div className="space-y-2 pt-16 text-center" id="contact-form-header">
            <h1 className="text-5xl font-bold tracking-tighter text-neutral-7 md:text-7xl">Contact Us</h1>
            <p className="text-muted-foreground text-neutral-6">
            Got a technical issue? Want to send feedback about a beta feature? Need details about our Business plan? Let us know.
            </p>
          </div>
          <form className="flex w-full flex-col space-y-4" aria-labelledby="contact-form-header">
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
              <TextArea id="message" placeholder="Write your message here..."></TextArea>
            </div>
            <Button className="ml-auto w-full text-neutral-1 sm:w-auto">Send message</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

