import { FC, ReactNode } from 'react';
import { IoReturnUpBackOutline } from "react-icons/io5";
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface FormSectionProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
}

export const FormSection: FC<FormSectionProps> = ({ title, children, icon }) => {
  return (
    <div className="space-y-4 text-wrap rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className='flex items-center gap-2'>
          {icon}
          <h3 className="text-lg font-bold text-primary">{title}</h3>
        </div>
        {title === 'Basic Information' && (
          <Button size="icon" variant='outline' type='button' className="w-max bg-white/80 px-4 hover:bg-neutral-2" onClick={() => redirect('/admin/inventory')}>
            <IoReturnUpBackOutline className="size-4" />
            Back to Inventory
          </Button>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};
