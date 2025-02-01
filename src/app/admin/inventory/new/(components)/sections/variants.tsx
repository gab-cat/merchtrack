'use client';

import { AiFillProduct } from "react-icons/ai";
import VariantFields from '../variant-fields';
import { FormSection } from "@/components/ui/form-section";
import { FormDescription } from "@/components/ui/form-description";

export function VariantsSection() {
  return (
    <FormSection title="Variants" icon={<AiFillProduct className='text-primary'/>}>
      <FormDescription>
        Add different variations of your product like sizes or colors, each with its own pricing structure.
      </FormDescription>
      <VariantFields />
    </FormSection>
  );
}
