import { JSX } from "react";
import { CustomBreadcrumb } from "@/components/ui/custom-breadcrumbs";

const PageTitle = ({ title, level = 1 }: {title: string, level?: 1 | 2 | 3 | 4 | 5 | 6}) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return (
    <div>
      <CustomBreadcrumb />
      <Tag className="pb-4 text-5xl font-semibold tracking-tight text-neutral-7">{title}</Tag>
    </div>
    
  );
};

export default PageTitle;