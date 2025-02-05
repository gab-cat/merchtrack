import { FaSearch } from "react-icons/fa";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  onSearch: (query: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  return (
    <div className="relative">
      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      <Input
        placeholder="Search"
        className="w-[240px] border-0 bg-gray-100 pl-10"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
}

