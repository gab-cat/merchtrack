'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Role } from '@prisma/client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDescription } from "@/components/ui/form-description";
import { FormError } from "@/components/ui/form-error";
import type { CreateProductType } from '@/schema/products.schema';

export default function VariantFields() {
  const { control, register, formState: { errors } } = useFormContext<CreateProductType>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variants"
  });

  const defaultRolePricing = {
    PLAYER: 0,
    STUDENT: 0,
    STAFF_FACULTY: 0,
    ALUMNI: 0,
    OTHERS: 0,
    STUDENT_NON_COLLEGE: 0
  };

  return (
    <div className="space-y-4">
      <FormDescription>
        Add different variations of your product with specific pricing for each role.
      </FormDescription>
      
      {fields.map((field, index) => (
        <div key={field.id} className="relative rounded-lg border p-4">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-destructive hover:text-destructive/90 absolute right-2 top-2"
            onClick={() => remove(index)}
          >
            <Trash2 size={20} />
          </Button>

          <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`variant-name-${index}`}>Variant Name</Label>
              <Input
                id={`variant-name-${index}`}
                type="text"
                placeholder="e.g., Red / XL"
                {...register(`variants.${index}.variantName`)}
              />
              <FormDescription>
                Enter a unique identifier for this variant (e.g., color, size).
              </FormDescription>
              {errors.variants?.[index]?.variantName && (
                <FormError>{errors.variants[index]?.variantName?.message}</FormError>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`base-price-${index}`}>Base Price</Label>
              <Input
                id={`base-price-${index}`}
                type="number"
                placeholder="0.00"
                {...register(`variants.${index}.price`, { valueAsNumber: true })}
              />
              <FormDescription>
                Set the standard price for this variant.
              </FormDescription>
              {errors.variants?.[index]?.price && (
                <FormError>{errors.variants[index]?.price?.message}</FormError>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {Object.values(Role).map((role) => (
              <div key={role} className="space-y-2">
                <Label htmlFor={`role-price-${index}-${role}`}>{role} Price</Label>
                <Input
                  id={`role-price-${index}-${role}`}
                  type="number"
                  placeholder="0.00"
                  {...register(`variants.${index}.rolePricing.${role}`, { valueAsNumber: true })}
                />
                {errors.variants?.[index]?.rolePricing?.[role] && (
                  <FormError>{errors.variants[index]?.rolePricing?.[role]?.message}</FormError>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="default"
        className="w-full text-white"
        onClick={() => append({ variantName: '', price: 0, rolePricing: defaultRolePricing })}
      >
        <Plus size={20} className="mr-2" />
        Add Variant
      </Button>
    </div>
  );
}
