'use server';

import prisma from "@/lib/db";
import { invalidateCache } from "@/lib/redis";
import { verifyPermission } from "@/utils/permissions";
import type { ExtendedProduct } from "@/types/extended";
import { createLog } from "@/actions/logs.actions";

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
): ActionsReturnType<ExtendedProduct> {
  if (!await verifyPermission({
    userId: userId,
    permissions: {
      inventory: { canRead: true, canDelete: true },
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
    invalidateCache(keysToInvalidate);

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