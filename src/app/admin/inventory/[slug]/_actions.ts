'use server';

import { Prisma } from "@prisma/client";
import prisma from "@/lib/db";
import { invalidateCache } from "@/lib/redis";
import { type CreateProductType as UpdateProductType } from "@/schema/products.schema";
import { verifyPermission } from "@/utils/permissions";
import type { ExtendedProduct } from "@/types/extended";

/**
 * Updates a product in the database after verifying user permissions and cleaning the provided data.
 *
 * This asynchronous function first checks if the user (identified by `userId`) has the necessary read permissions. 
 * It cleans the update data by removing extraneous fields (such as `_tempFiles`, `postedBy`, `category`, and `reviews`), 
 * and reformats the `variants` array to delete existing variants and create new ones with prices converted to Prisma decimals.
 * The function then verifies that the product (identified by `productId`) exists before updating it. If the product is 
 * not found or if an error occurs during the update process, an object with a failure message is returned. Upon a successful 
 * update, the function caches the updated product data and invalidates related cache entries.
 *
 * @param userId - The ID of the user making the update request.
 * @param productId - The unique identifier of the product to update.
 * @param data - The update payload containing the product details, including an array of variant objects.
 * @returns A promise that resolves to an object indicating the outcome of the operation. On success, the object contains the updated product data; on failure, it includes an error message.
 *
 * @example
 * const result = await updateProduct('user123', 'prod456', {
 *   name: 'Updated Product Name',
 *   description: 'Updated description',
 *   variants: [
 *     { variantName: 'Standard', price: 19.99, rolePricing: { regular: 19.99 } }
 *   ],
 *   // Additional fields as defined by UpdateProductType
 * });
 *
 * if (result.success) {
 *   console.log('Product updated successfully:', result.data);
 * } else {
 *   console.error('Failed to update product:', result.message);
 * }
 */
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

    // Keep existing imageUrl if not provided in update
    // This prevents accidental image removal during regular updates
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

    // Get total number of product pages
    const totalProducts = await prisma.product.count();
    const totalPages = Math.ceil(totalProducts / 12); // Assuming 10 products per page

    // Invalidate cache
    const keysToInvalidate = [
      `products:all`,
      `product:${product.id}`,
      `product:${product.slug}`,
      'products:total',
      ...Array.from({ length: totalPages }, (_, i) => `products:${i + 1}:*`)
    ];
    await invalidateCache(keysToInvalidate);

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


/**
 * Deletes a product by its ID after verifying user permissions.
 *
 * This function first verifies if the user has the required permissions to delete a product.
 * It then checks whether the product with the provided ID exists. If the product is not found,
 * a failure response is returned with an appropriate error message. If the product exists,
 * it is deleted from the database along with its related entities such as category, postedBy,
 * reviews, and variants. After deletion, the function invalidates multiple cache entries related
 * to the products, ensuring cache freshness. In the event of any errors during the process,
 * a failure response containing the error message is returned.
 *
 * @param userId - The ID of the user attempting the deletion.
 * @param productId - The ID of the product to delete.
 * @returns A promise that resolves to an object indicating whether the deletion was successful.
 */
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

    // Get total number of product pages
    const totalProducts = await prisma.product.count();
    const totalPages = Math.ceil(totalProducts / 12); // Assuming 10 products per page

    // Invalidate cache
    const keysToInvalidate = [
      `products:all`,
      `product:${product.id}`,
      `product:${product.slug}`,
      'products:total',
      ...Array.from({ length: totalPages }, (_, i) => `products:${i + 1}:*`)
    ];
    await invalidateCache(keysToInvalidate);

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
