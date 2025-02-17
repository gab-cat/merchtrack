"use client";

import { FiSearch } from "react-icons/fi";
import { Input } from "@/components/ui/input";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchInput({ value, onChange, placeholder = "Search...", className = "" }: Readonly<SearchInputProps>) {
  return (
    <div className={`relative flex-1 sm:max-w-xs ${className}`}>
      <FiSearch className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9"
      />
    </div>
  );
}