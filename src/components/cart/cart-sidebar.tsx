'use client';

import React, { useEffect } from 'react';
import { X, ShoppingCart, Trash2, MessageSquareText } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { FaMoneyBillWave } from 'react-icons/fa';
import { useCartStore } from '@/stores/cart.store';
import { useUserStore } from '@/stores/user.store';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/utils/format';
import QuantitySelector from '@/components/ui/quantity-selector';
import { updateCartItemSelection, updateCartItemQuantity, removeCartItem as removeCartItemAction, updateCartItemNote } from '@/actions/cart.actions';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function CartSidebar() {
  const { isCartOpen, setCartOpen, cartItems, updateCartItem, removeCartItem, clearCart } = useCartStore();
  const { userId } = useUserStore();
  
  const selectedItems = cartItems.filter(item => item.selected);
  const selectedCount = selectedItems.length;
  const subtotal = selectedItems.reduce((total, item) => {
    return total + Number(item.variant.price) * item.quantity;
  }, 0);

  const handleSelectAll = async (checked: boolean) => {
    cartItems.forEach(item => {
      updateCartItem(item.variantId, { selected: checked });
      if (userId) {
        updateCartItemSelection(item.variantId, userId, checked).catch(error => {
          console.error('Failed to update item selection:', error);
        });
      }
    });
  };

  const handleSelectionChange = async (variantId: string, selected: boolean) => {
    updateCartItem(variantId, { selected });
    if (userId) {
      try {
        await updateCartItemSelection(variantId, userId, selected);
      } catch (error) {
        console.error('Failed to update item selection:', error);
        toast.error('Failed to update item selection');
      }
    }
  };

  const handleNoteChange = async (variantId: string, note: string) => {
    updateCartItem(variantId, { note });
    if (userId) {
      try {
        await updateCartItemNote(userId, variantId, note);
      } catch (error) {
        console.error('Failed to update item note:', error);
        toast.error('Failed to update note');
      }
    }
  };

  const handleQuantityChange = async (variantId: string, quantity: number) => {
    const item = cartItems.find(item => item.variantId === variantId);
    if (!item) return;

    if (quantity > (item.variant?.inventory || 0) && item.variant.product.inventoryType === 'STOCK') {
      toast.error('Not enough stock available');
      return;
    }

    if (quantity < 1) {
      handleRemoveItem(variantId);
      return;
    }

    updateCartItem(variantId, { quantity });
    
    if (userId) {
      try {
        await updateCartItemQuantity(userId, variantId, quantity);
      } catch (error) {
        console.error('Failed to update quantity:', error);
        toast.error('Failed to update quantity');
        updateCartItem(variantId, { quantity: item.quantity });
      }
    }
  };

  const handleRemoveItem = async (variantId: string) => {
    removeCartItem(variantId);
    if (userId) {
      try {
        await removeCartItemAction(userId, variantId);
      } catch (error) {
        console.error('Failed to remove item:', error);
        toast.error('Failed to remove item from cart');
      }
    }
  };

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  const allSelected = cartItems.length > 0 && cartItems.every(item => item.selected);

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-lg">
        <SheetHeader className="px-6 py-4">
          <SheetTitle className="flex items-center">
            <ShoppingCart className="mr-2 size-5" />
            Your Cart
            <span className="ml-2 rounded-full bg-primary px-2 py-1 text-xs text-white">
              {cartItems.length}
            </span>
          </SheetTitle>
        </SheetHeader>

        {cartItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center space-y-4 px-6">
            <ShoppingCart className="size-10 text-gray-300" />
            <p className="text-muted-foreground text-center">Your cart is empty</p>
            <Button onClick={() => setCartOpen(false)}>Continue Shopping</Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b px-6 py-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="selectAll" 
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="selectAll" className="text-sm font-medium">
                  Select All ({cartItems.length})
                </label>
              </div>
              <Button variant="ghost" size="sm" onClick={clearCart}>
                <Trash2 className="mr-2 size-4" />
                Clear Cart
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-4 px-6 py-4">
                {cartItems.map((item) => (
                  <div key={item.variantId} className="flex flex-col space-y-2 rounded-lg border p-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={item.selected}
                        onCheckedChange={(checked) => handleSelectionChange(item.variantId, !!checked)}
                      />
                      <div className="relative size-16 overflow-hidden rounded-md border">
                        <Image
                          src={item.variant.product.imageUrl?.[0] ?? '/img/profile-placeholder-img.png'}
                          alt={item.variant.product.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <h3 className="font-medium">{item.variant.product.title}</h3>
                        <p className="text-muted-foreground text-sm">{item.variant.variantName}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <QuantitySelector
                              value={item.quantity}
                              onChange={(value) => handleQuantityChange(item.variantId, value)}
                              min={1}
                              max={item.variant.inventory ?? 10}
                              compact
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.variantId)}
                              className="size-8 hover:text-red-600"
                            >
                              <X className="size-4" />
                            </Button>
                          </div>
                          <p className="font-medium">{formatCurrency(Number(item.variant.price) * item.quantity)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 pl-9 pt-1">
                      <MessageSquareText className="size-4 shrink-0 text-primary" />
                      <Input
                        placeholder="Add note for this item..."
                        value={item.note || ''}
                        onChange={(e) => handleNoteChange(item.variantId, e.target.value)}
                        className="h-8 grow text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t px-6 py-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Selected Items:</span>
                  <span>{selectedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-lg font-semibold">Subtotal:</span>
                  <span className="text-lg font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                <Alert className="mt-2">
                  <FaMoneyBillWave className="size-4 text-blue-600" />
                  <AlertTitle className="text-blue-800">Order Now, Pay Later!</AlertTitle>
                  <AlertDescription className="text-sm text-blue-700">
                    Place your order now and pay when you&apos;re ready. Complete the payment through the My Orders page to start processing your order.
                  </AlertDescription>
                </Alert>
              </div>
              <Link href="/checkout" passHref>
                <Button 
                  disabled={selectedCount === 0} 
                  className="mt-4 w-full"
                  onClick={() => setCartOpen(false)}
                >
                  Place Order ({selectedCount})
                </Button>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}