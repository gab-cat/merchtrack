'use client';

import { useFormContext } from 'react-hook-form';
import { FaImage } from "react-icons/fa";
import ImageUpload from '../image-upload';
import { FormSection } from "@/components/ui/form-section";
import { FormDescription } from "@/components/ui/form-description";
import { FormError } from "@/components/ui/form-error";
import type { CreateProductType } from '@/schema/products.schema';

export function ImagesSection({ onChange }: Readonly<{ onChange?: (urls: string[], files?: File[]) => void }>) {
  const { watch, setValue, formState: { errors } } = useFormContext<CreateProductType>();

  return (
    <FormSection title="Images" icon={<FaImage className='text-primary'/>}>
      <FormDescription>
        Add up to 5 high-quality images of your product. The first image will be used as the main display image.
      </FormDescription>
      <ImageUpload
        value={watch('imageUrl')}
        onChange={(urls, files) => {
          setValue('imageUrl', urls);
          onChange?.(urls, files);
        }}
      />
      {errors.imageUrl && (
        <FormError>{errors.imageUrl.message}</FormError>
      )}
    </FormSection>
  );
}
