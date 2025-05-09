'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FaSave } from 'react-icons/fa';
import { CgSpinner } from 'react-icons/cg';
import { MdCategory } from 'react-icons/md';
import { Pencil, Trash2 } from 'lucide-react';
import { createCategory, updateCategory, deleteCategory } from '../actions';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createNewCategorySchema, type CreateNewCategoryType } from '@/schema/category.schema';
import { useUserStore } from '@/stores/user.store';
import { useCategoriesQuery } from '@/hooks/categories.hooks';
import useToast from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function ManageCategoriesDialog() {
  const { userId } = useUserStore();
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string; description?: string } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading } = useCategoriesQuery();
  
  const form = useForm<CreateNewCategoryType>({
    mode: 'onBlur',
    resolver: zodResolver(createNewCategorySchema),
    defaultValues: {
      name: '',
      description: ''
    }
  });

  const { mutate: createMutate, isPending: isCreatePending } = useMutation({
    mutationFn: async (formData: CreateNewCategoryType) => createCategory({
      userId: userId as string,
      name: formData.name,
      description: formData.description
    }),
    onSuccess: () => {
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['categories:all'] });
      useToast({
        type: 'success',
        message: 'Category created successfully',
        title: 'Success'
      });
    },
    onError: (error: string) => {
      useToast({
        type: 'error',
        message: error,
        title: 'Error'
      });
    }
  });

  const { mutate: updateMutate, isPending: isUpdatePending } = useMutation({
    mutationFn: async (formData: CreateNewCategoryType) => {
      if (!selectedCategory) return;
      return updateCategory({
        userId: userId as string,
        id: selectedCategory.id,
        name: formData.name,
        description: formData.description
      });
    },
    onSuccess: () => {
      form.reset();
      setSelectedCategory(null);
      queryClient.invalidateQueries({ queryKey: ['categories:all'] });
      useToast({
        type: 'success',
        message: 'Category updated successfully',
        title: 'Success'
      });
    },
    onError: (error: string) => {
      useToast({
        type: 'error',
        message: error,
        title: 'Error'
      });
    }
  });

  const { mutate: deleteMutate, isPending: isDeletePending } = useMutation({
    mutationFn: async () => {
      if (!selectedCategory) return;
      return deleteCategory({
        userId: userId as string,
        id: selectedCategory.id
      });
    },
    onSuccess: () => {
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
      queryClient.invalidateQueries({ queryKey: ['categories:all'] });
      useToast({
        type: 'success',
        message: 'Category deleted successfully',
        title: 'Success'
      });
    },
    onError: (error: string) => {
      useToast({
        type: 'error',
        message: error,
        title: 'Error'
      });
    }
  });

  const handleSubmit = (formData: CreateNewCategoryType) => {
    if (selectedCategory) {
      updateMutate(formData);
    } else {
      createMutate(formData);
    }
  };

  const handleEdit = (category: { id: string; name: string; description: string | null }) => {
    setSelectedCategory({
      id: category.id,
      name: category.name,
      description: category.description || undefined
    });
    form.reset({ 
      name: category.name,
      description: category.description || ''
    });
  };

  const handleDelete = (category: { id: string; name: string; description: string | null }) => {
    setSelectedCategory({
      id: category.id,
      name: category.name,
      description: category.description || undefined
    });
    setIsDeleteDialogOpen(true);
  };

  const isPending = isCreatePending || isUpdatePending;

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center">
            <MdCategory className="mr-2" /> Manage Categories
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-neutral-2">
          <DialogHeader>
            <DialogTitle className="flex items-center font-bold text-primary">
              <MdCategory className="mr-2" /> 
              {selectedCategory ? 'Update Category' : 'Create Category'}
            </DialogTitle>
          </DialogHeader>

          <div className="my-4 space-y-4">
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  placeholder="Enter category name"
                  required
                  {...form.register('name')}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter category description (optional)"
                  className="resize-none"
                  {...form.register('description')}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                {selectedCategory && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSelectedCategory(null);
                      form.reset({ name: '', description: '' });
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button 
                  type="submit" 
                  disabled={isPending}
                  className={cn(isPending ? 'bg-gray-600' : 'bg-primary', 'text-white')}
                >
                  {!isPending ? (
                    <span className="flex items-center">
                      <FaSave className="mr-2" /> 
                      {selectedCategory ? 'Update Category' : 'Create Category'}
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <CgSpinner className="mr-2 animate-spin" /> 
                      {selectedCategory ? 'Updating ...' : 'Creating ...'}
                    </span>
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-8">
              <h3 className="mb-4 text-lg font-bold text-primary">Existing Categories</h3>
              <div className="flex max-h-72 flex-col space-y-2 overflow-y-auto rounded-md border border-neutral-4 p-2">
                {isLoading ? (
                  <div className="text-center text-gray-500">Loading categories...</div>
                ) : categories.length === 0 ? (
                  <div className="text-center text-gray-500">No categories found</div>
                ) : (
                  categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex flex-col rounded-lg border px-2 py-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-primary">{category.name}</span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(category)}
                            className="hover:text-primary"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(category)}
                            className="hover:text-red-500"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                      {category.description && (
                        <p className="mt-1 text-sm text-neutral-7">
                          {category.description}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category
              &quot;{selectedCategory?.name}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletePending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeletePending}
              className="bg-red-500 hover:bg-red-600"
              onClick={() => deleteMutate()}
            >
              {isDeletePending ? (
                <span className="flex items-center">
                  <CgSpinner className="mr-2 animate-spin" /> Deleting...
                </span>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}