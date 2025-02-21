'use server';

import { Prisma } from "@prisma/client";
import prisma from "@/lib/db";
import { invalidateCache } from "@/lib/redis";
import { type CreateProductType as UpdateProductType } from "@/schema/products.schema";
import { verifyPermission } from "@/utils/permissions";
import type { ExtendedProduct } from "@/types/extended";
import { createLog } from "@/actions/logs.actions";
import { processActionReturnData } from "@/utils";

/**
 * Updates a product in the database.
 *
 * This asynchronous function first verifies that the user (identified by `userId`) has the required read permissions.
 * It then checks whether the product specified by `productId` exists. If the user is not authorized or the product is not found,
 * a log entry is created using the logging utility and an error response is returned.
 *
 * The provided `data` payload is cleaned by removing extraneous fields (such as `_tempFiles`, `postedBy`, `category`, and `reviews`)
 * and processing the `variants` array. The variants are reformatted by deleting existing variants and creating new ones, with
 * prices converted to Prisma decimals. After updating the product, the function caches the updated data and invalidates
 * related cache entries (covering product details and paginated product lists) to ensure consistency.
 *
 * @param userId - The ID of the user making the update request.
 * @param productId - The unique identifier of the product to update.
 * @param data - The update payload containing the product details, including an array of variant objects.
 * @returns A promise that resolves to an object indicating the outcome of the operation. On success, the object contains the updated
 * product data; on failure, it includes an appropriate error message.
 *
 * @example
 * const result = await updateProduct('user123', 'prod456', {
 *   name: 'Updated Product Name',
 *   description: 'Updated product description',
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
    await createLog({
      userId,
      createdById: userId,
      reason: "Product Update Failed - Unauthorized",
      systemText: `Unauthorized attempt to update product ${productId}`,
      userText: "You are not authorized to update products."
    });
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
      await createLog({
        userId,
        createdById: userId,
        reason: "Product Update Failed - Not Found",
        systemText: `Attempted to update non-existent product ${productId}`,
        userText: "Product not found"
      });
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

    await createLog({
      userId,
      createdById: userId,
      reason: "Product Updated Successfully",
      // @ts-expect-error - data is not defined in ExtendedProduct
      systemText: `Updated product "${product.title}" (ID: ${product.id}). Changes: ${Object.keys(data).filter(key => data[key] !== existingProduct[key]).join(', ')}`,
      userText: `Product "${product.title}" has been updated successfully.`
    });

    return {
      success: true,
      data: processActionReturnData(product) as ExtendedProduct
    };
  } catch (error) {
    await createLog({
      userId,
      createdById: userId,
      reason: "Product Update Error",
      systemText: `Error updating product ${productId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      userText: "An error occurred while updating the product."
    });
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update product'
    };
  }
}


/**
 * Deletes a product by its ID after verifying that the user has the necessary permissions.
 *
 * This asynchronous function performs several operations:
 * 1. Verifies that the user (identified by `userId`) has the required dashboard read permissions.
 * 2. Checks whether the product with the given `productId` exists in the database.
 * 3. If permissions are insufficient or the product does not exist, logs the attempt and returns a failure response.
 * 4. If the product exists, deletes it along with its related entities (category, postedBy, reviews, and variants).
 * 5. Recalculates the total pages of products, invalidates cache entries related to product listings,
 *    single product details, and total count, ensuring data consistency.
 * 6. Logs the successful deletion or any errors encountered during the process.
 *
 * @param userId - The ID of the user attempting the deletion; must have valid dashboard read access.
 * @param productId - The unique identifier of the product to be deleted.
 * @returns A promise that resolves to an object containing a `success` flag indicating the outcome.
 *          In case of failure, the object may also include a `message` property describing the error.
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
    await createLog({
      userId,
      createdById: userId,
      reason: "Product Deletion Failed - Unauthorized",
      systemText: `Unauthorized attempt to delete product ${productId}`,
      userText: "You are not authorized to delete products."
    });
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
      await createLog({
        userId,
        createdById: userId,
        reason: "Product Deletion Failed - Not Found",
        systemText: `Attempted to delete non-existent product ${productId}`,
        userText: "Product not found"
      });
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

    await createLog({
      userId,
      createdById: userId,
      reason: "Product Deleted Successfully",
      systemText: `Deleted product "${product.title}" (ID: ${product.id})`,
      userText: `Product "${product.title}" has been deleted successfully.`
    });

    return {
      success: true,
    };
  } catch (error) {
    await createLog({
      userId,
      createdById: userId,
      reason: "Product Deletion Error",
      systemText: `Error deleting product ${productId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      userText: "An error occurred while deleting the product."
    });
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete product'
    };
  }
}
