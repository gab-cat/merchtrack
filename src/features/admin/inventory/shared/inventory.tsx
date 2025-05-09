'use client';

import { useFormContext } from 'react-hook-form';
import { FaBoxes } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormSection } from "@/components/ui/form-section";
import { FormDescription } from "@/components/ui/form-description";
import { FormError } from "@/components/ui/form-error";
import type { CreateProductType } from '@/features/admin/inventory/products.schema';

export function InventorySection() {
  const { register, setValue, watch, formState: { errors } } = useFormContext<CreateProductType>();

  return (
    <FormSection title="Inventory" icon={<FaBoxes className='text-primary'/>}>
      <FormDescription>
            Choose whether this product is available for immediate purchase or pre-order.
      </FormDescription>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        
        <div className="space-y-2">
          <Label htmlFor="inventory">Inventory Count</Label>
          <Input
            id="inventory"
            type="number"
            placeholder="0"
            {...register('inventory', { valueAsNumber: true })}
          />
          <FormDescription>
            Set the initial stock quantity. Use 0 for pre-order items.
          </FormDescription>
          {errors.inventory && (
            <FormError>{errors.inventory.message}</FormError>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="inventoryType">Inventory Type</Label>
          <Select
            onValueChange={(value) => setValue('inventoryType', value as "PREORDER" | "STOCK")}
            defaultValue={watch('inventoryType')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select inventory type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PREORDER">Pre-order</SelectItem>
              <SelectItem value="STOCK">In Stock</SelectItem>
            </SelectContent>
          </Select>

          {errors.inventoryType && (
            <FormError>{errors.inventoryType.message}</FormError>
          )}
        </div>
      </div>
    </FormSection>
  );
}
