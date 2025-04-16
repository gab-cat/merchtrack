'use client';

import { FaBoxes } from "react-icons/fa";
import { useFormContext } from "react-hook-form";
import { FormDescription } from "@/components/ui/form-description";
import { FormSection } from "@/components/ui/form-section";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/ui/form-error";
import type { CreateProductType } from '@/schema/products.schema';

export function StatusSection() {
  const { setValue, watch, formState: { errors } } = useFormContext<CreateProductType>();
  
  const isDeleted = watch('isDeleted') || false;

  return (
    <FormSection title="Status" icon={<FaBoxes className='text-primary'/>}>
      <FormDescription>
        Toggle the status of this product.
      </FormDescription>
      <div className="mt-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Switch 
              checked={!isDeleted} 
              onCheckedChange={(checked) => setValue('isDeleted', !checked)} 
            />
            <Label>{isDeleted ? "Inactive" : "Active"}</Label>
          </div>
          <FormDescription>
            {isDeleted ? 
              "This product will be hidden from customers." : 
              "This product will be visible to customers."}
          </FormDescription>
          {errors.isDeleted && (
            <FormError>{errors.isDeleted.message}</FormError>
          )}
        </div>
      </div>
    </FormSection>
  );
}
