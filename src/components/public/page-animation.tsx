'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const PageAnimation = ({ children, className }: { children: React.ReactNode, className?: string  }) => {
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        className="flex min-h-[75vh] justify-center" style={{ fontFamily: 'var(--font-inter-sans)' }}>
        <div className={cn("w-full px-4 md:px-6", className)}>
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PageAnimation;