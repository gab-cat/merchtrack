'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { FAQS_DETAILS } from "@/constants";
import { FAQS_SECTIONS } from "@/constants/faqs";
import { cn } from '@/lib/utils';

const FaqsBody = () => {
  const [selectedSection, setSelectedSection] = useState<string>(FAQS_SECTIONS[0]);

  const filteredFaqs = useMemo(() => {
    return selectedSection
      ? FAQS_DETAILS.filter(faq => faq.section === selectedSection)
      : FAQS_DETAILS;
  }, [selectedSection]);

  return (
    <>
      <div className="flex justify-center space-x-2 py-4 pt-8">
        {FAQS_SECTIONS.map((section, index) => (
          <Button
            key={index}
            variant={selectedSection === section ? "default" : "outline"}
            color="blue"
            className={cn('rounded-full font-bold', selectedSection === section ? 'text-white' : 'text-primary')}
            onClick={() => setSelectedSection(section)}
          >
            {section}
          </Button>
        ))}
      </div>
      {/* Rendering a dynamic list of FAQs and their corresponding answers */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <Accordion 
            type="single" 
            collapsible 
            className="py-4"
            aria-label="Frequently Asked Questions"
            defaultValue="item-0"
          >
            {filteredFaqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className='font-bold'>{faq.question}</AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default FaqsBody;