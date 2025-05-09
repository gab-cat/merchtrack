'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { FaFileAlt } from "react-icons/fa";
import { X } from "lucide-react";
import DOMPurify from 'isomorphic-dompurify';
import { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSection } from "@/components/ui/form-section";
import { FormDescription } from "@/components/ui/form-description";
import { FormError } from "@/components/ui/form-error";
import type { CreateProductType } from '@/features/admin/inventory/products.schema';
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useCategoriesQuery } from '@/hooks/categories.hooks';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  description?: string;
  categoryId?: string;
}

export function BasicInformationSection({ description, categoryId }: Readonly<Props>) {
  const { register, control, formState: { errors }, watch, setValue } = useFormContext<CreateProductType>();
  const { data: categories = [], isSuccess: isCategoriesLoaded } = useCategoriesQuery();
  const tags = watch('tags') ?? []; 
  const [currentDescription, setCurrentDescription] = useState<string | undefined>(description);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const target = e.target as HTMLInputElement;
      const value = target.value.trim();
      
      if (value && tags.length < 10 && !tags.includes(value)) {
        setValue('tags', [...tags, value], { shouldDirty: true }); // Add shouldDirty option
        target.value = '';
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setValue('tags', tags.filter(tag => tag !== tagToRemove), { shouldDirty: true }); // Add shouldDirty option
  };

  useEffect(() => {
    if (description) {
      setCurrentDescription(description);
      setValue('description', description);
    }
  }, [description, setValue]);

  useEffect(() => {
    if (categoryId && isCategoriesLoaded) {
      const categoryExists = categories.some(category => category.id === categoryId);
      if (categoryExists) {
        setValue('categoryId', categoryId, { shouldDirty: true });
      }
    }
  }, [categoryId, categories, isCategoriesLoaded, setValue]);

  return (
    <FormSection title="Basic Information" icon={<FaFileAlt className='text-primary'/>}>
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Product Title</Label>
          <Input
            id="title"
            type="text"
            placeholder="e.g., Vintage College Hoodie"
            {...register('title')}
            aria-invalid={!!errors.title}
          />
          <FormDescription>
            Enter a clear, descriptive name for your product that customers will easily understand.
          </FormDescription>
          {errors.title && (
            <FormError>{errors.title.message}</FormError>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          {description && (
            <div className="rounded-md bg-gray-100 p-2 text-gray-700">
              <p className='text-semibold text-base font-semibold text-neutral-7'>Current Description</p>
              <div 
                className='text-sm' 
                suppressHydrationWarning
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description)}}/>
            </div>
          )}
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                value={currentDescription ?? ''}
                onChange={(value) => {
                  field.onChange(value);
                  setCurrentDescription(value);
                }}
                placeholder="Describe your product's features, materials, and any other important details..."
              />
            )}
          />
          <FormDescription>
            Provide detailed information about your product. Include materials, care instructions, and any special features.
          </FormDescription>
          {errors.description && (
            <FormError>{errors.description.message}</FormError>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <div className="space-y-2">
            <Input
              id="tags"
              type="text"
              placeholder="Type a tag and press Enter"
              pattern="[A-Za-z0-9\s-]+"
              title="Tags can only contain letters, numbers, spaces, and hyphens"
              onKeyDown={handleKeyDown}
            />
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 rounded-full border border-primary/50 bg-primary/10 px-3 py-1 text-sm text-primary"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-primary hover:text-primary/80"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
            <FormDescription>
              Add up to 10 tags to help categorize your product. Press Enter to add a tag.
            </FormDescription>
            {errors.tags && (
              <FormError>{errors.tags.message}</FormError>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
                name='categoryId'
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FormDescription>
            Choose a category that best fits your product.
          </FormDescription>
          {errors.categoryId && (
            <FormError>{errors.categoryId.message}</FormError>
          )}
        </div>
      </div>
    </FormSection>
  );
}
