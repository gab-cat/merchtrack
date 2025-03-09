import type { CartItem } from '@/stores/cart.store';

export function cartTotalAmount(items: CartItem[]): number {
  return items.reduce(
    (total, item) => total + Number(item.variant.price) * item.quantity,
    0
  );
}

export function validateCartItems(items: CartItem[]): {
  valid: boolean;
  error?: string;
} {
  if (items.length === 0) {
    return {
      valid: false,
      error: 'Cart is empty',
    };
  }

  for (const item of items) {
    if (item.quantity <= 0) {
      return {
        valid: false,
        error: `Invalid quantity for ${item.variant.product?.title}`,
      };
    }

    if (item.quantity > item.variant.inventory) {
      return {
        valid: false,
        error: `Not enough stock for ${item.variant.product?.title}`,
      };
    }
  }

  return { valid: true };
}