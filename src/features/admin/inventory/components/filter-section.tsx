import { type ReactNode } from 'react';
import { Checkbox } from "@/components/ui/checkbox";

export type FilterItem = {
  value: string;
  label: string;
};

export interface FilterSectionProps {
  title: string;
  icon: ReactNode;
  items: FilterItem[];
  checkedValues: string[];
  onFilterChange: (value: string) => void;
}

export function FilterSection({ 
  title, 
  icon, 
  items, 
  checkedValues, 
  onFilterChange 
}: Readonly<FilterSectionProps>) {
  return (
    <div>
      <h3 className="mb-4 flex items-center text-lg font-semibold text-primary">
        {icon} {title}
      </h3>
      <div className="space-y-3">
        {items.map(({ value, label }) => (
          <div key={value} className="flex items-center">
            <Checkbox
              id={`${title.toLowerCase()}-${value}`}
              checked={checkedValues.includes(value)}
              onCheckedChange={() => onFilterChange(value)}
            />
            <label
              htmlFor={`${title.toLowerCase()}-${value}`}
              className="ml-2 text-sm font-medium"
            >
              {label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}