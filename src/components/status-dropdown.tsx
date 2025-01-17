"use client";

import * as React from "react";
import { ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface StatusOption {
  label: string
  value: string
  variant?: "default" | "outline"
  className?: string
}

interface StatusDropdownProps {
  options: StatusOption[]
  value: string
  onChange: (value: string) => void
  align?: "start" | "center" | "end"
}

export function StatusDropdown({ options, value, onChange, align = "center" }: StatusDropdownProps) {
  const selectedOption = options.find(option => option.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <div className="flex items-center gap-1">
          <Badge
            variant={selectedOption?.variant || "default"}
            className={cn("min-w-[80px]", selectedOption?.className)}
          >
            {selectedOption?.label || value}
          </Badge>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="min-w-[120px]">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className="flex items-center gap-2"
          >
            <Badge
              variant={option.variant || "default"}
              className={cn("min-w-[80px]", option.className)}
            >
              {option.label}
            </Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

