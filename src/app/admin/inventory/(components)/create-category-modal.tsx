'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { FaSave } from "react-icons/fa";
import { CgSpinner } from "react-icons/cg";
import { MdCreateNewFolder } from "react-icons/md";
import { createCategory } from '../_actions';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createNewCategorySchema, CreateNewCategoryType } from '@/schema/category.schema';
import { useUserStore } from '@/stores/user.store';
import useToast from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function CreateCategoryModal() {
  const { userId } = useUserStore();
  const form = useForm({
    mode: 'onBlur',
    resolver: zodResolver(createNewCategorySchema),
    defaultValues: {
      name: ''
    }
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData: CreateNewCategoryType) => createCategory({
      userId: userId!,
      name: formData.name
    }),
    onSuccess: () => {
      form.reset();
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

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className='flex items-center'><MdCreateNewFolder className='mr-2'/> New Category</Button>
      </DialogTrigger>
      <DialogContent className='bg-neutral-2'>
        <DialogHeader>
          <DialogTitle className='flex items-center font-semibold text-primary'><MdCreateNewFolder className='mr-2'/> Create Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((formData) => mutate(formData))} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              placeholder="Enter category name"
              required
              {...form.register('name')}
            />
          </div>
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isPending}
              className={cn(isPending ? 'bg-gray-600' : 'bg-primary', 'text-white')}
            >
              {!isPending 
                ? (<span className='flex items-center'><FaSave className='mr-2'/> Create Category</span>)
                : (<span className='flex items-center'><CgSpinner className='mr-2 animate-spin'/> Creating ...</span>)

              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}