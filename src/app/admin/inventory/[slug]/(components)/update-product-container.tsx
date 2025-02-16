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
import { useProductSlugQuery } from '@/hooks/products.hooks';
import useToast from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { deleteProductImages, uploadProductImages } from '@/actions/media.actions';
import { fadeInUp } from '@/constants/animations';
import { cn } from '@/lib/utils';


interface UpdateProductContainerProps {
  slug: string;
}

export default function UpdateProductContainer({ slug }: Readonly<UpdateProductContainerProps>) {
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<UpdateProductType | null>(null);
  const [isPendingImageOp, setIsPendingImageOp] = useState(false);
  const { userId } = useUserStore();
  const router = useRouter();
  
  const { data: product, isLoading } = useProductSlugQuery(slug);
  
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
      const response = await updateProduct(userId as string, product?.id as string, formData);
      if (!response.success) {
        throw new Error(response.message);
      }
      return response.data;
    },
    mutationKey: ['products:all'],
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

  const { mutate: deleteProduct, isPending: isDeletePending }= useMutation({
    mutationFn: async () => await deleteProductById(userId as string, product?.id as string),
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

  const handleImageChange = async (urls: string[], files?: File[]) => {
    try {
      setIsPendingImageOp(true);
      if (files && files.length > 0) {
        // Handle new image uploads using server action
        const imageResult = await uploadProductImages(userId as string, files);
        if (!imageResult.success || !imageResult.data) {
          throw new Error(imageResult.message || 'Failed to upload images');
        }
        
        // Update URLs in DB
        const updateResult = await updateProduct(userId as string, product?.id as string, {
          ...methods.getValues(),
          imageUrl: [...(product?.imageUrl || []), ...imageResult.data]
        });

        if (!updateResult.success || !updateResult.data) {
          throw new Error(updateResult.message || 'Failed to update product');
        }

        methods.setValue('imageUrl', updateResult.data.imageUrl || []);
      } else {
        // Handle image removal using server action
        const previousUrls = product?.imageUrl || [];
        const removedUrls = previousUrls.filter(url => !urls.includes(url));

        if (removedUrls.length > 0) {
          // Delete from R2 and update DB in parallel
          await Promise.all([
            deleteProductImages(userId as string, removedUrls),
            updateProduct(userId as string, product?.id as string, {
              ...methods.getValues(),
              imageUrl: urls
            })
          ]);
        }

        methods.setValue('imageUrl', urls);
      }

      useToast({
        type: "success",
        message: "Images updated successfully",
        title: "Success"
      });
    } catch (error) {
      useToast({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to update images",
        title: "Error"
      });
      // Revert to previous state on error
      methods.setValue('imageUrl', product?.imageUrl || []);
    } finally {
      setIsPendingImageOp(false);
    }
  };

  const handleSubmit = (formData: UpdateProductType) => {
    // Remove image handling from main update since it's handled separately
    setFormDataToSubmit({ 
      ...formData,
      imageUrl: product?.imageUrl || [] // Ensure imageUrl is always an array
    });
    setIsSaveDialogOpen(true);
  };

  const confirmSave = async () => {
    if (!formDataToSubmit) return;
    mutate(formDataToSubmit);
    setIsSaveDialogOpen(false);
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
          <BasicInformationSection description={product.description as string}/>
          <ImagesSection onChange={handleImageChange} isLoading={isPendingImageOp} />
          <InventorySection />
          <VariantsSection />
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              className={cn('text-white bg-red-500', isDeletePending ? 'bg-gray-400' : 'bg-red-500')}
              disabled={isPending || isDeletePending}
              onClick={(event) => { event.preventDefault(); setIsDeleteDialogOpen(true); }}
              variant={isPending ? 'ghost' : 'destructive'}
            >
              {!isDeletePending 
                ? (<><FaRegTrashAlt className="mr-2 size-4" /> Delete Product</>)
                : (<><AiOutlineLoading3Quarters className="mr-2 size-5 animate-spin" /> Deleting...</>)
              }
            </Button>
            <Button 
              type="button" 
              className={cn('text-white', isPending ? 'bg-gray-400' : 'bg-primary')}
              disabled={isPending || isDeletePending}
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
