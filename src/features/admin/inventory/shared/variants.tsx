'use client';

import { useFormContext } from 'react-hook-form';
import { AiFillProduct } from "react-icons/ai";
import VariantFields from './variant-fields';
import { InventoryAdjuster } from '.';
import { FormSection } from "@/components/ui/form-section";
import { FormDescription } from "@/components/ui/form-description";
import type { ExtendedProduct } from "@/types/extended";
import type { CreateProductType } from '@/features/admin/inventory/products.schema';

type VariantsSectionProps = {
  product?: ExtendedProduct;
};

export function VariantsSection({ product }: Readonly<VariantsSectionProps>) {
  const methods = useFormContext<CreateProductType>();
  const isEditMode = !!product;

  return (
    <FormSection title="Variants" icon={<AiFillProduct className='text-primary'/>}>
      <FormDescription>
        Add different variations of your product like sizes or colors, each with its own pricing structure.
      </FormDescription>
      <VariantFields />
      
      {isEditMode && product && product.variants && product.variants.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-medium">Inventory Management</h3>
          <p className="text-sm text-gray-500">
            Use the controls below to adjust inventory for each variant.
          </p>
          
          {product.variants.map((variant) => (
            <div key={variant.id} className="mt-4">
              <InventoryAdjuster 
                productId={product.id}
                variantId={variant.id}
                slug={product.slug}
                variantName={variant.variantName}
                currentInventory={variant.inventory}
                onSuccess={(newInventory) => {
                  // Update the inventory in the form
                  const variants = methods.getValues('variants');
                  const updatedVariants = variants.map(v => 
                    v.id === variant.id ? { ...v, inventory: newInventory } : v
                  );
                  methods.setValue('variants', updatedVariants, { shouldDirty: true });
                }}
              />
            </div>
          ))}
        </div>
      )}
    </FormSection>
  );
}
