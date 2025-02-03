import { FC, HTMLAttributes } from 'react';
import { FaInfoCircle } from "react-icons/fa";
import { cn } from '@/lib/utils';

export const FormDescription: FC<HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => {
  return (
    <div className='flex w-max items-center space-x-2 rounded-lg bg-primary-100 px-4 py-1'>
      <FaInfoCircle className="text-sm text-primary-500" />
      <p
        className={cn("text-xs text-primary-500", className)}
        {...props}
      />
    </div>
  );
};
