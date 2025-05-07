'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { Info, ShoppingCart, Loader2, MapPin, AlertTriangle, FileText } from 'lucide-react';
import { useCartStore } from '@/stores/cart.store';
import { useUserStore } from '@/stores/user.store';
import { processCheckout } from '@/actions/checkout.actions';
import { PURCHASE_POLICY_CONTENT } from '@/constants/purchase-policy';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

const checkoutFormSchema = z.object({
  customerNotes: z.string().max(500, 'Note cannot exceed 500 characters').optional(),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions to place an order',
  }),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export function CheckoutForm() {
  const router = useRouter();
  const { cartItems, clearCart } = useCartStore();
  const { user } = useUserStore();
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const termsRef = useRef<HTMLDivElement>(null);
  
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customerNotes: '',
      termsAccepted: false,
    },
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!termsRef.current) return;
    
    const element = e.target as HTMLDivElement;
    const isAtBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50; // 50px threshold
    
    if (isAtBottom && !hasReadTerms) {
      setHasReadTerms(true);
    }
  };

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
          note: item.note,
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
                  Payment is required upon checkout to confirm your order. Please ensure you have selected the correct items and quantities.
                </AlertDescription>
              </Alert>

              <Alert>
                <MapPin className="size-4" />
                <AlertDescription>
                  Pickup Location will be announced regularly on the official Gold in Blue Facebook page. Please check for updates.
                </AlertDescription>
              </Alert>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel className="flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  Terms and Conditions
                </FormLabel>
                {!hasReadTerms && (
                  <span className="text-xs text-yellow-600">Please read through the terms before accepting</span>
                )}
              </div>
              
              <div className="relative">
                <ScrollArea 
                  ref={termsRef}
                  onScrollCapture={handleScroll}
                  className="h-[300px] w-full rounded-md border border-gray-200 bg-gray-50/50 p-4"
                >
                  <div className="space-y-6 text-sm text-gray-700">
                    <div className="rounded-lg border border-primary/10 bg-primary/5 p-4">
                      <h3 className="mb-2 font-semibold text-primary">{PURCHASE_POLICY_CONTENT.title}</h3>
                      <p className="text-sm text-gray-600">{PURCHASE_POLICY_CONTENT.description}</p>
                    </div>

                    {PURCHASE_POLICY_CONTENT.sections.map((section) => (
                      <div key={`section-${section.title}`} className="space-y-3">
                        <h4 className="font-medium text-gray-900">{section.title}</h4>
                        
                        {section.content && (
                          <p className="text-gray-600">{section.content}</p>
                        )}
                        
                        {section.requirements && (
                          <ul className="ml-4 list-inside list-disc space-y-1 text-gray-600">
                            {section.requirements.map((req) => (
                              <li key={`req-${req}`}>{req}</li>
                            ))}
                          </ul>
                        )}
                        
                        {section.items && (
                          <div className="space-y-3">
                            {section.items.map((item) => (
                              <div key={item.id} className="rounded-md bg-white p-3 shadow-sm">
                                <h5 className="mb-1 text-sm font-medium text-gray-900">{item.title}</h5>
                                <p className="text-sm text-gray-600">{item.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {section.conditions && (
                          <ul className="ml-4 list-inside list-disc space-y-1 text-gray-600">
                            {section.conditions.map((condition) => (
                              <li key={`condition-${condition}`}>{condition}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                {!hasReadTerms && (
                  <div className="pointer-events-none absolute inset-0 flex items-end justify-center p-4">
                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-800">
                      Scroll to continue reading
                    </span>
                  </div>
                )}
              </div>
              
              <FormField
                control={form.control}
                name="termsAccepted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!hasReadTerms}
                        className={!hasReadTerms ? 'cursor-not-allowed opacity-50' : ''}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className={!hasReadTerms ? 'cursor-not-allowed opacity-50' : ''}>
                        I have read and agree to the terms and conditions above
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled
            >
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