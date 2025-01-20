'use client';

import { AnimatePresence, motion } from 'framer-motion';
import FaqsBody from '@/components/public/faqs-body';
import { FAQS_CONTENT } from '@/constants';

const Page = () => {
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="flex min-h-[75vh] justify-center" style={{ fontFamily: 'var(--font-inter-sans)' }}>
        <div className="w-full max-w-4xl px-4 md:px-6">
          <div className="place-self-center py-4 pt-16 text-5xl tracking-tighter md:text-8xl">
            {FAQS_CONTENT.title}
          </div>
          <div className="w-5/6 place-self-center text-sm">
            {FAQS_CONTENT.description}
          </div>
          <FaqsBody />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Page;