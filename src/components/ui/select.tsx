"use client"; // Indicates this is a Client Component in Next.js

import * as React from "react"; // Import React
import * as SelectPrimitive from "@radix-ui/react-select"; // Import Radix UI Select components
import { Check, ChevronDown } from "lucide-react"; // Import icons from lucide-react

// Re-export Radix UI Select components for convenience
const Select = SelectPrimitive.Root; // Root component for the Select
const SelectGroup = SelectPrimitive.Group; // Group component for grouping Select items
const SelectValue = SelectPrimitive.Value; // Value component to display the selected value

// Custom SelectTrigger component wrapping Radix UI's SelectPrimitive.Trigger
const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>, // Forward ref to the trigger element
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> // Forward props to the trigger element
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={`border-input ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-10 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="size-4 opacity-100" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName; // Set display name for debugging

// Custom SelectContent component wrapping Radix UI's SelectPrimitive.Content
const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>, // Forward ref to the content element
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> // Forward props to the content element
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={`relative z-50 min-w-32 overflow-hidden rounded-md border bg-white text-gray-900 shadow-md animate-in fade-in-80 ${
        position === "popper" ? "translate-y-1" : ""
      } ${className}`}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={`p-1 ${
          position === "popper"
            ? "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
            : ""
        }`}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName; // Set display name for debugging

// Custom SelectLabel component wrapping Radix UI's SelectPrimitive.Label
const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>, // Forward ref to the label element
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label> // Forward props to the label element
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label ref={ref} className={`py-1.5 pl-8 pr-2 text-sm font-semibold ${className}`} {...props} />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName; // Set display name for debugging

// Custom SelectItem component wrapping Radix UI's SelectPrimitive.Item
const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>, // Forward ref to the item element
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> // Forward props to the item element
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={`focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity- relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-blue-50 data-[disabled]:pointer-events-none ${className}`}
    {...props}
  >
    <span className="absolute left-2 flex size-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="size-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName; // Set display name for debugging

// Custom SelectSeparator component wrapping Radix UI's SelectPrimitive.Separator
const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>, // Forward ref to the separator element
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator> // Forward props to the separator element
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator ref={ref} className={`bg-muted -mx-1 my-1 h-px ${className}`} {...props} />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName; // Set display name for debugging

// Export all components for use in other files
export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator };