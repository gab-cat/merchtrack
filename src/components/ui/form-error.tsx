import { FC, HTMLAttributes } from 'react';
import { MdError } from "react-icons/md";
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const FormError: FC<HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className='flex w-max items-center space-x-2 text-wrap rounded-lg bg-accent-destructive/20 px-4 py-1'>
      <MdError className="text-sm text-accent-destructive" />
      <p
        className={cn("text-xs text-accent-destructive", className)}
        {...props}
      />
    </motion.div>
  );
};
