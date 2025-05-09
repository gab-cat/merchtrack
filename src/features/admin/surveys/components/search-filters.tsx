import { memo } from "react";
import { Search } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  startDate?: string;
  endDate?: string;
}

export const SearchFilters = memo(({ 
  searchTerm, 
  onSearchChange,
  startDate,
  endDate,
}: SearchFilterProps) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="text-muted-foreground absolute left-2 top-2.5 size-4" />
        <Input
          placeholder="Search responses..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      <div className="flex items-center gap-2">
        <DatePicker 
          name="start-date"
          initialValue={startDate}
          placeholder="Start date"
        />
        <span className="text-muted-foreground">to</span>
        <DatePicker 
          name="end-date"
          initialValue={endDate}
          placeholder="End date"
        />
      </div>
    </div>
  );
});

SearchFilters.displayName = 'SearchFilters';