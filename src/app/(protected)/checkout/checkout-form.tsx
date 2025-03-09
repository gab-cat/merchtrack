'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { Info, ShoppingCart, Loader2, Calendar, Clock, MapPin, AlertTriangle } from 'lucide-react';
import { useCartStore } from '@/stores/cart.store';
import { useUserStore } from '@/stores/user.store';
import { processCheckout } from '@/actions/checkout.actions';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

const checkoutFormSchema = z.object({
  customerNotes: z.string().max(500, 'Note cannot exceed 500 characters').optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export function CheckoutForm() {
  const router = useRouter();
  const { cartItems, clearCart } = useCartStore();
  const { user } = useUserStore();
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customerNotes: '',
    },
  });

  const selectedItems = cartItems.filter(item => item.selected);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      if (!user?.id || selectedItems.length === 0) {
        throw new Error('Unable to process checkout. Please make sure you have selected items in your cart.');
      }
      return processCheckout({
        userId: user.id,
        items: selectedItems.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          price: Number(item.variant.price),
        })),
        customerNotes: form.getValues('customerNotes'),
      });
    },
    onSuccess: (result) => {
      if (result.success) {
        clearCart();
        toast.success('Order placed successfully!');
        router.push('/my-account/orders');
      } else {
        toast.error(result.message ?? 'Failed to place order');
      }
    },
    onError: (error: Error) => {
      console.error('Checkout error:', error);
      toast.error(error.message ?? 'An error occurred during checkout');
    },
  });

  if (selectedItems.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p>No items selected for checkout. Please select items from your cart first.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <ShoppingCart className="size-5" />
          Order Details
        </CardTitle>
      </CardHeader>
      <CardContent className='bg-white'>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(() => mutate())} className="space-y-6">
            <FormField
              control={form.control}
              name="customerNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any special instructions or notes for your order..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 text-sm">
              <Alert>
                <Info className="size-4" />
                <AlertDescription>
                  Please review your order carefully before proceeding. Orders cannot be modified once placed.
                </AlertDescription>
              </Alert>

              <Alert variant="destructive">
                <AlertTriangle className="size-4" />
                <AlertDescription>
                  Payment is required upon pickup. Please prepare the exact amount as change may not be available.
                </AlertDescription>
              </Alert>

              <Alert>
                <Clock className="size-4" />
                <AlertDescription>
                  Orders can be picked up during office hours (Mon-Fri, 9 AM - 5 PM).
                </AlertDescription>
              </Alert>

              <Alert>
                <Calendar className="size-4" />
                <AlertDescription>
                  Please pick up your order within 3 business days after receiving the ready for pickup notification.
                </AlertDescription>
              </Alert>

              <Alert>
                <MapPin className="size-4" />
                <AlertDescription>
                  Pickup Location: College of Computer Studies Office, Ground Floor
                </AlertDescription>
              </Alert>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Processing Order...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 size-4" />
                  Place Order
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}