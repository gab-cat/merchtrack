import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { resetPasswordForUser } from '@/app/admin/users/[email]/_actions';
import { useUserStore } from '@/stores/user.store';
import useToast from '@/hooks/use-toast';
import { resetUserPasswordSchema, ResetUserPasswordType } from '@/schema/user';
import { Form } from '@/components/ui/form';

interface ResetPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  email: string;
}


export function ResetPasswordDialog({ open, onOpenChange, userId, email }: ResetPasswordDialogProps) {
  const { userId: requesterId } = useUserStore();
  const toast = useToast;
  const form = useForm({
    resolver: zodResolver(resetUserPasswordSchema),
    mode: 'onBlur',
    defaultValues: {
      newPassword: '',
      userId: requesterId,
      clerkId: userId,
      skipLegalChecks: false,
      signOutOfOtherSessions: true
    }
  });

  const { mutate, isPending: isLoading } = useMutation({
    mutationKey: [`users:${email}`],
    mutationFn: (formData: ResetUserPasswordType) => resetPasswordForUser(requesterId as string, {
      userId: requesterId as string,
      params: {
        ...formData
      }
    }),
    onSuccess: (response) => {
      if (!response.success) {
        toast({
          type: 'error',
          message: response.message as string,
          title: 'Error Resetting Password'
        });
        return;
      }
      toast({
        type: 'success',
        message: 'User password has been reset and sign out of other sessions.',
        title: 'Success Password Reset'
      });
      form.reset();
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        type: 'error',
        message: error.message,
        title: 'Error Resetting Password'
      });
    }
  });



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-lg bg-white p-6 shadow-xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutate(data))}>
            <DialogHeader>
              <DialogTitle className="bg-primary bg-clip-text text-lg font-semibold text-transparent">
            Reset Password
              </DialogTitle>
              <DialogDescription className="my-4 text-gray-600">
            Enter a new password for the user (minimum 8 characters).
              </DialogDescription>

            </DialogHeader>

            <Input
              type="text"
              placeholder="New Password"
              {...form.register('newPassword')}
              className="mt-2 w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {form.formState.errors.newPassword && <p className="text-sm text-red-600">{form.formState.errors.newPassword.message}</p>}
        
            <DialogFooter className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
              </Button>
              <Button disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
