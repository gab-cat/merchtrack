'use server';

import { Prisma } from "@prisma/client";
import prisma from "@/lib/db";
import { setCached } from "@/lib/redis";
import { type CreateProductType as UpdateProductType } from "@/schema/products.schema";
import { verifyPermission } from "@/utils/permissions";
import type { ExtendedProduct } from "@/types/extended";

export async function updateProduct(
  userId: string,
  productId: string,
  data: UpdateProductType
): Promise<ActionsReturnType<ExtendedProduct>> {
  if (!await verifyPermission({
    userId: userId,
    permissions: {
      dashboard: { canRead: true },
    }
  })) {
    return {
      success: false,
      message: "You are not authorized to update products."
    };
  }

  try {
    // Clean up the data before update
    const cleanData = {
      ...data,
      _tempFiles: undefined,
      postedBy: undefined,
      category: undefined,
      reviews: undefined,
      variants: {
        deleteMany: {},
        create: data.variants.map(variant => ({
          variantName: variant.variantName,
          price: new Prisma.Decimal(variant.price.toString()),
          rolePricing: variant.rolePricing
        }))
      }
    };

    // Verify product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!existingProduct) {
      return {
        success: false,
        message: "Product not found"
      };
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: cleanData,
      include: {
        category: true,
        postedBy: true,
        reviews: true,
        variants: true
      }
    });

    // Prepare cache data
    const cacheData = JSON.parse(JSON.stringify(product));

    // Update cache with comprehensive invalidation
    await Promise.all([
      setCached(`products:all`, null),
      setCached(`product:${product.id}`, cacheData),
      setCached(`product:${product.slug}`, cacheData),
      setCached('products:total', null),
      // Invalidate paginated caches
      ...Array.from({ length: 10 }, (_, i) => 
        setCached(`products:${i + 1}:*`, null)
      )
    ]);

    return {
      success: true,
      data: cacheData
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update product'
    };
  }
}


export async function deleteProductById(
  userId: string,
  productId: string
): Promise<ActionsReturnType<ExtendedProduct>> {
  if (!await verifyPermission({
    userId: userId,
    permissions: {
      dashboard: { canRead: true },
    }
  })) {
    return {
      success: false,
      message: "You are not authorized to delete products."
    };
  }

  try {
    // Verify product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!existingProduct) {
      return {
        success: false,
        message: "Product not found"
      };
    }

    const product = await prisma.product.delete({
      where: { id: productId },
      include: {
        category: true,
        postedBy: true,
        reviews: true,
        variants: true
      }
    });

    // Comprehensive cache invalidation
    await Promise.all([
      setCached(`products:all`, null),
      setCached(`product:${product.id}`, null),
      setCached(`product:${product.slug}`, null),
      setCached('products:total', null),
      // Invalidate paginated caches
      ...Array.from({ length: 10 }, (_, i) => 
        setCached(`products:${i + 1}:*`, null)
      )
    ]);

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete product'
    };
  }
}
