import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { FAQS_CONTENT, FAQS_DETAILS } from '@/constants';

const Page = () => {
  return (
    <div className="min-h-[75vh] flex justify-center" style={{ fontFamily: 'var(--font-inter-sans)' }}>
      <div className="w-[75vh]">
        <div className="place-self-center text-5xl py-4">
          {FAQS_CONTENT.title}
        </div>
        <div className="place-self-center w-5/6 text-sm">
          {FAQS_CONTENT.description}
        </div>
        <div className="py-4 flex justify-center space-x-2">
          <Button variant="outline" color="blue" className="rounded-full">Orders</Button>
          <Button variant="outline" color="blue" className="rounded-full">Payments</Button>
          <Button variant="outline" color="blue" className="rounded-full">Products</Button>
          <Button variant="outline" color="blue" className="rounded-full">Returns & Refunds</Button>
          <Button variant="outline" color="blue" className="rounded-full">Contact & Support</Button>
        </div>
        {/* Rendering a dynamic list of FAQs and their corresponding answers */}
        <Accordion type="single" collapsible className="py-4">
          {FAQS_DETAILS.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default Page;