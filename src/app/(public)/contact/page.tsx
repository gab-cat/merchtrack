'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const ContactPage = () => {
  return (
    <div className="container mx-auto px-4 py-8 md:py-8 max-w-2xl">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-neutral-8">Contact Us</h1>
          <p className="text-muted-foreground text-neutral-6">
            Got a technical issue? Want to send feedback about a beta feature? Need details about our Business plan? Let us know.
          </p>
        </div>
        <form className="space-y-4">
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
            <textarea id="message" rows={10} className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm" placeholder="Write your message here..."/>
          </div>
          <Button className="w-full sm:w-auto text-neutral-1">Send message</Button>
        </form>
      </div>
    </div>
  )
}

export default ContactPage

