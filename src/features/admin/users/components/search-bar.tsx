"use client";

import { useDebounce } from "use-debounce";
import { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  onSearch: (value: string) => void;
  placeholder?: string;
}

export function SearchBar(props: SearchBarProps) {
  // Destructure props inside component to avoid serialization warning
  const { onSearch, placeholder = "Search users..." } = props;
  const [value, setValue] = useState("");
  const [debouncedValue] = useDebounce(value, 500);

  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  return (
    <div className="relative">
      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-[320px] border-0 bg-gray-100 pl-10"
      />
    </div>
  );
}

