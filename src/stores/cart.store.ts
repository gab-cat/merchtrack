import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProductVariant } from '@prisma/client';

export type CartItem = {
  variantId: string;
  quantity: number;
  selected: boolean;
  note?: string;
  variant: ProductVariant & {
    product: {
      title: string;
      imageUrl: string[];
      inventoryType?: 'STOCK' | 'PREORDER';
    };
    rolePricing?: {
      price: number;
      roleId: string;
    } | null;
  };
};

type CartState = {
  cartItems: CartItem[];
  isCartOpen: boolean;
  addItem: (item: Omit<CartItem, 'selected'>) => void;
  removeCartItem: (variantId: string) => void;
  updateCartItem: (variantId: string, update: Partial<Omit<CartItem, 'variantId' | 'variant'>>) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
};

export const useCartStore = create(
  persist<CartState>(
    (set) => ({
      cartItems: [],
      isCartOpen: false,
      addItem: (item) =>
        set((state) => {
          const existingItem = state.cartItems.find((i) => i.variantId === item.variantId);
          if (existingItem) {
            return {
              cartItems: state.cartItems.map((i) =>
                i.variantId === item.variantId
                  ? { ...i, quantity: i.quantity + item.quantity, note: item.note || i.note }
                  : i
              ),
            };
          }
          // Add new item with selected=true by default
          return { cartItems: [...state.cartItems, { ...item, selected: true }] };
        }),
      removeCartItem: (variantId) =>
        set((state) => ({
          cartItems: state.cartItems.filter((i) => i.variantId !== variantId),
        })),
      updateCartItem: (variantId, update) =>
        set((state) => ({
          cartItems: state.cartItems.map((i) =>
            i.variantId === variantId ? { ...i, ...update } : i
          ),
        })),
      clearCart: () => set({ cartItems: [] }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      setCartOpen: (open) => set({ isCartOpen: open }),
    }),
    {
      name: 'cart-storage',
    }
  )
);