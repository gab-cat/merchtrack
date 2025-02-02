'use server';

import { Product } from "@prisma/client";
import prisma from "@/lib/db";
import { getCached, setCached } from "@/lib/redis";
import { QueryParams, PaginatedResponse } from "@/types/common";
import { ExtendedProduct, GetObjectByTParams } from "@/types/extended";
import { verifyPermission } from "@/utils/permissions";
import { calculatePagination, removeFields } from "@/utils/query.utils";


/**
 * Retrieves a paginated list of products.
 *
 * This asynchronous function verifies that the provided user has permission to read products,
 * then calculates pagination details, and attempts to retrieve cached products and the total
 * product count. If the cache is empty, it fetches the products and count from the database
 * within a single transaction, caches the results, processes the products to remove restricted
 * fields based on the provided parameters, and finally returns a paginated response with metadata.
 *
 * @param userId - The unique identifier of the user. The user must have read permissions for products.
 * @param params - Optional query parameters for pagination (e.g., page, skip, take) and for limiting fields.
 *
 * @returns A promise that resolves to an object indicating the operation's success. On success, it returns:
 *  - data: An array of processed products (ExtendedProduct) with fields removed as specified.
 *  - metadata: Pagination details including total number of products, current page, last page, and flags
 *              indicating if there are previous or next pages.
 *  On failure (e.g., if the user is unauthorized or an error occurs during data retrieval), it returns
 *  an object with a false success flag and an error message.
 *
 * @example
 * const response = await getProducts("user123", { page: 2, limitFields: ['sensitiveField'] });
 * if (response.success) {
 *   console.log("Products:", response.data.data);
 *   console.log("Metadata:", response.data.metadata);
 * } else {
 *   console.error("Error:", response.message);
 * }
 */
export async function getProducts(
  userId: string,
  params: QueryParams = {}
): Promise<ActionsReturnType<PaginatedResponse<ExtendedProduct[]>>> {
  if (!await verifyPermission({
    userId: userId,
    permissions: {
      dashboard: { canRead: true },
    }
  })) {
    return {
      success: false,
      message: "You are not authorized to view products."
    };
  }

  const { skip, take, page } = calculatePagination(params);

  try {
    let products: Product[] | null = await getCached(`products:${page}:${take}`);
    let total = await getCached('products:total');

    if (!products || !total) {
      [products, total] = await prisma.$transaction([
        prisma.product.findMany({
          where: { isDeleted: false },
          include: {
            category: true,
            postedBy: true,
            reviews: true,
            variants: true
          },
          skip,
          take
        }),
        prisma.product.count({ where: { isDeleted: false } })
      ]);
      
      Promise.all([
        await setCached(`products:${page}:${take}`, products),
        await setCached('products:total', total)
      ]);
    }

    const lastPage = Math.ceil(total as number / take);
    const processedProducts = products.map(product => 
      removeFields(product, params.limitFields)
    );

    return {
      success: true,
      data: {
        data: JSON.parse(JSON.stringify(processedProducts)),
        metadata: {
          total: total as number,
          page: page,
          lastPage: lastPage,
          hasNextPage: page < lastPage,
          hasPrevPage: page > 1
        }
      }
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message
    };
  }
}


/**
 * Retrieves a product by its unique ID after verifying user permissions and utilizing caching.
 *
 * The function first checks if the user identified by `userId` has permission to read product data. If the user is not authorized,
 * an error response is immediately returned. It then attempts to fetch the product from the cache using a key derived from `productId`.
 * If the product is not found in the cache, it queries the database using Prisma to retrieve the product along with its related
 * category, postedBy, reviews, and variants. Upon retrieval, the product is cached for future requests. Before returning,
 * the function removes any fields specified in `limitFields` from the product data. In the event of an error during these operations,
 * the function returns a failure response containing the error message.
 *
 * @param userId - The ID of the user requesting the product.
 * @param limitFields - Specifies which fields to exclude from the returned product data.
 * @param productId - The unique identifier of the product to retrieve.
 *
 * @returns An object indicating the success of the operation, with either the processed product data or an error message.
 */
export async function getProductById({ userId, limitFields, productId }: GetObjectByTParams<"productId">): Promise<ActionsReturnType<ExtendedProduct>> {
  if (!await verifyPermission({
    userId: userId,
    permissions: {
      dashboard: { canRead: true },
    }
  })) {
    return {
      success: false,
      message: "You are not authorized to view products."
    };
  }

  try {
    let product: Product | null = await getCached(`product:${productId}`);
    if (!product) {
      product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          category: true,
          postedBy: true,
          reviews: true,
          variants: true
        }
      });
      await setCached(`product:${productId}`, product);
    }

    if (!product) {
      return {
        success: false,
        message: "Product not found."
      };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(removeFields(product, limitFields)))
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message
    };
  }
}

/**
 * Retrieves a product by its slug while verifying user permissions.
 *
 * This asynchronous function first checks if the user, identified by `userId`,
 * is authorized to read product data. It then attempts to retrieve the product from cache using a key built from `slug`.
 * If the product is not cached, it fetches the product from the database including its associated category,
 * poster information, reviews, and variants, and caches the retrieved result. If the product is not found or an error occurs,
 * a failure response with an appropriate message is returned.
 *
 * @param params - An object containing the following properties:
 * @param params.userId - The ID of the user making the request.
 * @param params.limitFields - Fields to exclude from the returned product data.
 * @param params.slug - The unique slug identifier of the product.
 * @returns A promise that resolves to an object indicating success. On success, the `data` property contains the product
 *          (as an ExtendedProduct) with the specified fields removed. On failure, the returned object includes an error message.
 *
 * @example
 * ```typescript
 * const result = await getProductBySlug({
 *   userId: 'user123',
 *   limitFields: ['sensitiveField'],
 *   slug: 'my-product-slug'
 * });
 *
 * if (result.success) {
 *   console.log('Product:', result.data);
 * } else {
 *   console.error('Error:', result.message);
 * }
 * ```
 */
export async function getProductBySlug({ userId, limitFields, slug }: GetObjectByTParams<"slug">): Promise<ActionsReturnType<ExtendedProduct>> {
  if (!await verifyPermission({
    userId: userId,
    permissions: {
      dashboard: { canRead: true },
    }
  })) {
    return {
      success: false,
      message: "You are not authorized to view products."
    };
  }

  try {
    let product: Product | null = await getCached(`product:${slug}`);
    if (!product) {
      product = await prisma.product.findUnique({
        where: { slug },
        include: {
          category: true,
          postedBy: true,
          reviews: true,
          variants: true
        }
      });
      await setCached(`product:${slug}`, product);
    }

    if (!product) {
      return {
        success: false,
        message: "Product not found."
      };
    }

    return {
      success: true,
      data: JSON.parse(JSON.stringify(removeFields(product, limitFields)))
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message
    };
  }
}
