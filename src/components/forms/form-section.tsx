import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

type FormSectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function FormSection({ title, children, className = "" }: Readonly<FormSectionProps>) {
  return (
    <Card className={`p-6 ${className}`}>
      <h2 className="mb-4 text-xl font-semibold">{title}</h2>
      {children}
    </Card>
  );
}