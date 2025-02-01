import { FC, ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
}

export const FormSection: FC<FormSectionProps> = ({ title, children, icon }) => {
  return (
    <div className="space-y-4 text-wrap rounded-lg border bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-lg font-bold text-primary">{title}</h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};
