'use client';

import { useEffect, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaRegTrashAlt } from "react-icons/fa";
import { BasicInformationSection } from '../../new/(components)/sections/basic-information';
import { ImagesSection } from '../../new/(components)/sections/images';
import { InventorySection } from '../../new/(components)/sections/inventory';
import { VariantsSection } from '../../new/(components)/sections/variants';
import { ConfirmationDialog } from '../../new/(components)/confirmation-dialog';
import { deleteProductById, updateProduct } from '../_actions';
import { Button } from "@/components/ui/button";
import { createProductSchema as updateProductSchema, type CreateProductType as UpdateProductType } from '@/schema/products.schema';
import { useUserStore } from '@/stores/user.store';
import { useProductQuery } from '@/hooks/products.hooks';
import useToast from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { uploadImages } from '@/app/admin/inventory/new/_actions';
import { fadeInUp } from '@/constants/animations';


interface UpdateProductContainerProps {
  productId: string;
}

export default function UpdateProductContainer({ productId }: Readonly<UpdateProductContainerProps>) {
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<UpdateProductType | null>(null);
  const [tempFiles, setTempFiles] = useState<File[]>([]);
  const { userId } = useUserStore();
  const router = useRouter();
  
  const { data: product, isLoading } = useProductQuery(productId);
  
  const methods = useForm<UpdateProductType>({
    mode: 'onBlur',
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      title: '',
      description: '',
      categoryId: '',
      inventory: 0,
      inventoryType: 'STOCK',
      variants: [],
      imageUrl: [],
      tags: []
    }
  });

  useEffect(() => {
    if (product) {
      const formData = {
        title: product.title,
        description: product.description ?? '',
        categoryId: product.categoryId ?? undefined,
        inventory: product.inventory,
        inventoryType: product.inventoryType,
        tags: product.tags ?? [],
        imageUrl: product.imageUrl ?? [],
        variants: product.variants.map(variant => ({
          variantName: variant.variantName,
          price: Number(variant.price),
          rolePricing: variant.rolePricing as {
            PLAYER?: number;
            STUDENT?: number;
            STAFF_FACULTY?: number;
            ALUMNI?: number;
            OTHERS?: number;
          }
        }))
      };
      methods.reset(formData);
    }
  }, [product, methods]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: UpdateProductType) => {
      const response = await updateProduct(userId as string, productId, formData);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: () => {
      router.refresh();
      useToast({
        type: "success",
        message: "Product updated successfully",
        title: "Success"
      });
      router.push('/admin/inventory');
    },
    onError: (error: Error) => {
      useToast({
        type: "error",
        message: error.message || "Failed to update product",
        title: "Error updating product"
      });
    }
  });

  const { mutate: deleteProduct }: { mutate: () => void } = useMutation({
    mutationFn: async () => await deleteProductById(userId as string, productId),
    onSuccess: () => {
      router.push('/admin/inventory');
      useToast({
        type: "success",
        message: "Product deleted successfully",
        title: "Success"
      });
    },
    onError: (error: Error) => {
      useToast({
        type: "error",
        message: error.message || "Failed to delete product",
        title: "Error deleting product"
      });
    }
  });

  const handleImageChange = (urls: string[], files?: File[]) => {
    methods.setValue('imageUrl', urls);
    if (files) {
      setTempFiles(files);
    }
  };

  const handleSubmit = (formData: UpdateProductType) => {
    setFormDataToSubmit({ ...formData, _tempFiles: tempFiles });
    setIsSaveDialogOpen(true);
  };

  const confirmSave = async () => {
    if (!formDataToSubmit) return;

    try {
      let finalData = { ...formDataToSubmit };
      
      if (tempFiles.length > 0) {
        const formData = new FormData();
        tempFiles.forEach(file => {
          formData.append('files', file);
        });
        
        const imageResult = await uploadImages(userId as string, formData);
        if (!imageResult.success) {
          throw new Error(imageResult.message);
        }
        
        finalData = {
          ...finalData,
          imageUrl: [...(formDataToSubmit.imageUrl || []), ...(imageResult.data || [])]
        };
      }

      mutate(finalData);
      setIsSaveDialogOpen(false);
    } catch (error) {
      useToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to update product",
        title: "Error"
      });
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <motion.div {...fadeInUp}>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleSubmit)} className="mx-auto max-w-4xl space-y-6">
          <BasicInformationSection />
          <ImagesSection onChange={handleImageChange} />
          <InventorySection />
          <VariantsSection />
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              className='bg-red-500 text-white'
              disabled={isPending}
              onClick={(event) => { event.preventDefault(); setIsDeleteDialogOpen(true); }}
              variant={isPending ? 'ghost' : 'destructive'}
            >
              {!isPending 
                ? (<><FaRegTrashAlt className="mr-2 size-4" /> Delete Product</>)
                : (<><AiOutlineLoading3Quarters className="mr-2 size-5 animate-spin" /> Deleting...</>)
              }
            </Button>
            <Button 
              type="button" 
              className='text-white'
              disabled={isPending}
              variant={isPending ? 'ghost' : 'default'}
              onClick={() => handleSubmit(methods.getValues())}
            >
              {!isPending 
                ? (<><Save className="mr-2 size-4" /> Update Product</>)
                : (<><AiOutlineLoading3Quarters className="mr-2 size-5 animate-spin" /> Updating...</>)
              }
            </Button>
          </div>
        </form>
  
        <ConfirmationDialog
          open={isSaveDialogOpen}
          onOpenChange={setIsSaveDialogOpen}
          onConfirm={confirmSave}
          content={{
            title: "Update Product",
            description: "Are you sure you want to update this product? Please review all changes before confirming.",
            action: "Update",
          }}
          variant="primary"
        />
        <ConfirmationDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={deleteProduct}
          content={{
            title: "Delete Product",
            description: "Are you sure you want to delete this product? Please review all changes before confirming.",
            action: "Delete",
          }}
        />
      </FormProvider>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-12" />
            <Skeleton className="h-12" />
          </div>
        </div>
      ))}
    </div>
  );
}
