'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { RxReset } from "react-icons/rx";
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { 
  BasicInformationSection, 
  ImagesSection, 
  InventorySection, 
  VariantsSection, 
  ConfirmationDialog 
} from '../shared';
import { createProduct, uploadImages } from '../actions';
import { Button } from "@/components/ui/button";
import { createProductSchema, type CreateProductType } from '@/features/admin/inventory/products.schema';
import { useUserStore } from '@/stores/user.store';
import useToast from '@/hooks/use-toast';

export default function NewProductContainer() {
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<CreateProductType | null>(null);
  const [tempFiles, setTempFiles] = useState<File[]>([]);
  const { userId } = useUserStore();
  const methods = useForm<CreateProductType>({
    mode: 'onBlur',
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      variants: [{ variantName: '', price: 0 }],
      isBestPrice: false,
      inventory: 0,
      inventoryType: 'PREORDER',
      imageUrl: [],
      tags: [],
      categoryId: '',
    }
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (formData: CreateProductType) => createProduct(userId as string, formData),
    onSuccess: () => {
      useToast({
        type: "success",
        message: "Product created successfully",
        title: "Success"
      });
      methods.reset();
    },
    onError: (error: Error) => {
      useToast({
        type: "error",
        message: error.message,
        title: "Error creating product"
      });
    }
  });

  const handleReset = () => {
    if (methods.formState.isDirty) {
      setIsResetDialogOpen(true);
    }
  };

  const confirmReset = () => {
    methods.reset();
    setIsResetDialogOpen(false);
  };

  const handleImageChange = (urls: string[], files?: File[]) => {
    methods.setValue('imageUrl', urls, { shouldDirty: true });
    if (files) {
      setTempFiles(prevFiles => [...prevFiles, ...files]);
    } else {
      // If no new files, it means we're removing images
      // Find which URLs were removed and remove corresponding files
      const removedUrls = methods.getValues('imageUrl').filter(url => !urls.includes(url));
      setTempFiles(prevFiles => 
        prevFiles.filter((_, index) => !removedUrls.includes(methods.getValues('imageUrl')[index]))
      );
    }
  };

  const handleSubmit = async (formData: CreateProductType) => {
    setFormDataToSubmit({ ...formData, _tempFiles: tempFiles });
    setIsSaveDialogOpen(true);
  };

  const confirmSave = async () => {
    if (formDataToSubmit) {
      // First upload images
      const formData = new FormData();
      tempFiles.forEach(file => {
        formData.append('files', file);
      });
      
      const imageResult = await uploadImages(userId as string, formData);
      if (imageResult.success && imageResult.data) {
        // Then create product with real URLs
        const finalData = {
          ...formDataToSubmit,
          imageUrl: imageResult.data
        };
        mutate(finalData);
        setIsSaveDialogOpen(false);
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="mx-auto max-w-4xl space-y-6">
        <BasicInformationSection />
        <ImagesSection onChange={handleImageChange} isRealtime={false} />
        <InventorySection />
        <VariantsSection />
        
        <div className="flex justify-end space-x-4">
          <Button variant='outline' type="button" onClick={handleReset}>
            <RxReset className="mr-2 size-4" />
            Reset
          </Button>
          <Button type="submit" className='text-white'>
            { !isPending 
              ? (<><Save className="mr-2 size-4" /> Save Product</>)
              : (<><AiOutlineLoading3Quarters className="mr-2 size-5 animate-spin" /> Saving...</>)
            }
          </Button>
        </div>
      </form>

      <ConfirmationDialog
        open={isResetDialogOpen}
        onOpenChange={setIsResetDialogOpen}
        onConfirm={confirmReset}
        content={{
          title: "Reset Product",
          description: "Are you sure you want to reset the form? All unsaved changes will be lost.",
          action: "Reset",
        }}
        variant="destructive"
      />

      <ConfirmationDialog
        open={isSaveDialogOpen}
        onOpenChange={setIsSaveDialogOpen}
        onConfirm={confirmSave}
        content={{
          title: "Create Product",
          description: "Are you sure you want to create this product? Please review all details before confirming.",
          action: "Create",
        }}
        variant="primary"
      />
    </FormProvider>
  );
}
