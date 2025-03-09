'use client';

import CartSidebar from '@/components/cart/cart-sidebar';

export function CartProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <CartSidebar />
    </>
  );
}