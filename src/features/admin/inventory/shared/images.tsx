'use client';

import { useFormContext } from 'react-hook-form';
import { FaImage } from "react-icons/fa";
import { ImageUpload } from '.';
import { FormSection } from "@/components/ui/form-section";
import { FormDescription } from "@/components/ui/form-description";
import { FormError } from "@/components/ui/form-error";
import type { CreateProductType } from '@/features/admin/inventory/products.schema';

type ImagesSectionProps = Readonly<{
  onChange?: (urls: string[], files?: File[]) => void | Promise<void>;
  isLoading?: boolean;
  isRealtime?: boolean;
}>;

export function ImagesSection({ onChange, isLoading, isRealtime = false }: ImagesSectionProps) {
  const { watch, setValue, formState: { errors } } = useFormContext<CreateProductType>();
  
  const handleChange = async (urls: string[], files?: File[]) => {
    setValue('imageUrl', urls);
    if (onChange) {
      if (isRealtime) {
        await onChange(urls, files);
      } else {
        onChange(urls, files);
      }
    }
  };

  return (
    <FormSection title="Images" icon={<FaImage className='text-primary'/>}>
      <FormDescription>
        Add up to 5 high-quality images of your product. The first image will be used as the main display image.
      </FormDescription>
      <ImageUpload
        value={watch('imageUrl')}
        onChange={handleChange}
        isLoading={isLoading}
        isRealtime={isRealtime}
      />
      {errors.imageUrl && (
        <FormError>{errors.imageUrl.message}</FormError>
      )}
    </FormSection>
  );
}
