'use server';

import type { Cart, CartItem } from '@prisma/client';
import prisma from '@/lib/prisma';
import { processActionReturnData } from '@/utils';

// Action to update an item's selected state
export async function updateCartItemSelection(variantId: string, userId: string, selected: boolean): Promise<{ success: boolean; message?: string; data?: CartItem }> {
  try {
    // Get the user's cart
    const cart = await prisma.cart.findFirst({
      where: {
        userId,
      },
    });

    if (!cart) {
      return {
        success: false,
        message: 'Cart not found',
      };
    }

    // Find and update the cart item
    const updatedItem = await prisma.cartItem.updateMany({
      where: {
        cartId: cart.id,
        variantId,
      },
      data: {
        selected,
      },
    });

    if (!updatedItem) {
      return {
        success: false,
        message: 'Cart item not found',
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error updating cart item selection:', error);
    return {
      success: false,
      message: 'Failed to update cart item selection',
    };
  }
}

// Add item to cart or update quantity if it already exists
export async function addToCart(userId: string, variantId: string, quantity: number): Promise<{ success: boolean; message?: string; data?: CartItem }> {
  try {
    // Get or create user's cart
    let cart = await prisma.cart.findFirst({
      where: {
        userId,
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
        },
      });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        variantId,
      },
    });

    if (existingItem) {
      // Update quantity
      const updatedItem = await prisma.cartItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity: existingItem.quantity + quantity,
        },
      });

      return {
        success: true,
        data: updatedItem,
      };
    } else {
      // Add new item
      const newItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId,
          quantity,
          selected: true, // Default to selected
        },
      });

      return {
        success: true,
        data: newItem,
      };
    }
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return {
      success: false,
      message: 'Failed to add item to cart',
    };
  }
}

// Remove selected items from cart
export async function removeSelectedCartItems(userId: string): Promise<{ success: boolean; message?: string }> {
  try {
    // Get the user's cart
    const cart = await prisma.cart.findFirst({
      where: {
        userId,
      },
    });

    if (!cart) {
      return {
        success: false,
        message: 'Cart not found',
      };
    }

    // Delete selected items
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        selected: true,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error removing selected cart items:', error);
    return {
      success: false,
      message: 'Failed to remove selected cart items',
    };
  }
}

// Fetch user's cart with items
export async function getUserCart(userId: string): Promise<ActionsReturnType<Cart>> {
  try {
    const cart = await prisma.cart.findFirst({
      where: {
        userId,
      },
      include: {
        cartItems: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    title: true,
                    imageUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return {
        success: false,
        message: 'Cart not found',
      };
    }

    return {
      success: true,
      data: processActionReturnData(cart) as Cart,
    };
  } catch (error) {
    console.error('Error fetching user cart:', error);
    return {
      success: false,
      message: 'Failed to fetch user cart',
    };
  }
}

// Update cart item quantity
export async function updateCartItemQuantity(userId: string, variantId: string, quantity: number): Promise<{ success: boolean; message?: string }> {
  try {
    // Get the user's cart
    const cart = await prisma.cart.findFirst({
      where: {
        userId,
      },
    });

    if (!cart) {
      return {
        success: false,
        message: 'Cart not found',
      };
    }

    // Update the cart item
    await prisma.cartItem.updateMany({
      where: {
        cartId: cart.id,
        variantId,
      },
      data: {
        quantity,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    return {
      success: false,
      message: 'Failed to update cart item quantity',
    };
  }
}

// Remove item from cart
export async function removeCartItem(userId: string, variantId: string): Promise<{ success: boolean; message?: string }> {
  try {
    // Get the user's cart
    const cart = await prisma.cart.findFirst({
      where: {
        userId,
      },
    });

    if (!cart) {
      return {
        success: false,
        message: 'Cart not found',
      };
    }

    // Delete the cart item
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        variantId,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error removing cart item:', error);
    return {
      success: false,
      message: 'Failed to remove cart item',
    };
  }
}

// Clear cart
export async function clearCart(userId: string): Promise<{ success: boolean; message?: string }> {
  try {
    // Get the user's cart
    const cart = await prisma.cart.findFirst({
      where: {
        userId,
      },
    });

    if (!cart) {
      return {
        success: false,
        message: 'Cart not found',
      };
    }

    // Delete all cart items
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error clearing cart:', error);
    return {
      success: false,
      message: 'Failed to clear cart',
    };
  }
}

// Update cart item note
export async function updateCartItemNote(userId: string, variantId: string, note: string): Promise<{ success: boolean; message?: string }> {
  try {
    // Get the user's cart
    const cart = await prisma.cart.findFirst({
      where: {
        userId,
      },
    });
    if (!cart) {
      return {
        success: false,
        message: 'Cart not found',
      };
    }
    
    // Update the cart item note
    await prisma.cartItem.updateMany({
      where: {
        cartId: cart.id,
        variantId,
      },
      data: {
        note,
      },
    });
    
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error updating cart item note:', error);
    return {
      success: false,
      message: 'Failed to update cart item note',
    };
  }
}