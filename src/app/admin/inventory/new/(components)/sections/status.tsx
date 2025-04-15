'use client';

import { FaBoxes } from "react-icons/fa";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormDescription } from "@/components/ui/form-description";
import { FormSection } from "@/components/ui/form-section";
import { Switch } from "@/components/ui/switch"; // Assuming a Switch component exists

const statusSchema = z.object({
  isActive: z.boolean(),
});

export function StatusSection() {
  const { control } = useForm({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      isActive: true,
    },
  });

  return (
    <FormSection title="Status" icon={<FaBoxes className='text-primary'/>}>
      <FormDescription>
        Toggle the states of this product.
      </FormDescription>
      <div className="mt-4">
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <Switch {...field} checked={field.value} />
              <span>{field.value ? "Active" : "Inactive"}</span>
            </div>
          )}
        />
      </div>
    </FormSection>
  );
}
