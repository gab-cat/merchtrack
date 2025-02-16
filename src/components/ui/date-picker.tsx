"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  initialValue?: string;
  name: string;
  placeholder?: string;
}

export function DatePicker({ initialValue, name, placeholder = "Pick a date" }: DatePickerProps) {
  const [value, setValue] = React.useState(initialValue);
  const date = value ? new Date(value) : undefined;

  const handleSelect = (newDate?: Date) => {
    const newValue = newDate?.toISOString();
    setValue(newValue);
    // Dispatch a custom event that parent components can listen to
    window.dispatchEvent(new CustomEvent(`datechange:${name}`, { 
      detail: { value: newValue }
    }));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[200px] justify-start text-left font-normal",
            !date && "text-neutral-7"
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto bg-neutral-2 p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
