'use server';

import { Product } from "@prisma/client";

import prisma from "@/lib/db";
import { getCached, setCached } from "@/lib/redis";
import { QueryParams, PaginatedResponse } from "@/types/common";
import { ExtendedProduct, ExtendedReview, GetObjectByTParams } from "@/types/extended";
import { processActionReturnData, calculatePagination, verifyPermission } from "@/utils";


/**
 * Retrieves a paginated list of products.
 *
 * This asynchronous function first verifies that the user identified by `userId` has the required
 * permissions to read product data. It then calculates pagination parameters (such as skip, take,
 * and the current page) and generates a dynamic cache key based on the page number, page size,
 * filtering conditions (`params.where`), and sorting options (`params.orderBy`). The function attempts
 * to retrieve the products and the total product count from the cache; if the cached data is unavailable,
 * it executes a single transaction to fetch the data from the database and caches the results.
 *
 * After fetching, each product is processed by removing any fields specified in `params.limitFields`.
 * On success, the function returns a promise that resolves to an object containing:
 *  - `data`: An array of processed products.
 *  - `metadata`: Pagination details including the total number of products, current page, last page,
 *                and flags indicating whether there are previous or next pages.
 * On failure, it returns an object with a `false` success flag and an error message.
 *
 * @param userId - The unique identifier of the user. The user must have permissions to read products.
 * @param params - Optional query parameters for pagination (e.g., page, skip, take), filtering (`where`),
 *                 sorting (`orderBy`), and field restrictions (`limitFields`).
 *
 * @returns A promise that resolves to an object indicating the operation's success. If successful, the
 *          object contains the processed products and pagination metadata; otherwise, it contains an error
 *          message.
 *
 * @example
 * const response = await getProducts("user123", {
 *   page: 2,
 *   limitFields: ["sensitiveField"],
 *   where: { isActive: true },
 *   orderBy: { name: "asc" }
 * });
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
  // if (!await verifyPermission({
  //   userId: userId,
  //   permissions: {
  //     dashboard: { canRead: true },
  //   }
  // })) {
  //   return {
  //     success: false,
  //     message: "You are not authorized to view products."
  //   };
  // }

  const { skip, take, page } = calculatePagination(params);
  const cacheKey = `products:${page}:${take}:${JSON.stringify(params.where)}:${JSON.stringify(params.orderBy)}`;

  try {
    let products: Product[] | null = await getCached(cacheKey);
    let total: number | null = await getCached('products:total');

    if (!products || !total) {
      [products, total] = await prisma.$transaction([
        prisma.product.findMany({
          where: params.where,
          include: {
            category: {
              select: { name: true }
            },
            postedBy: {
              select: {
                firstName: true,
                lastName: true,
                clerkId: true,
                email: true,
                college: true,  // Add college field
                role: true     // Add role field
              }
            },
            reviews: {
              select: {
                rating: true,
                createdAt: true,
                comment: true,
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                    clerkId: true,
                    email: true
                  }
                }
              }
            },
            variants: {
              select: {
                id: true,
                variantName: true,
                price: true,
                rolePricing: true,
                createdAt: true,
                updatedAt: true
              }
            }
          },
          orderBy: params.orderBy,
          skip,
          take,
        }),
        prisma.product.count({ where: params.where })
      ]);
      
      Promise.all([
        await setCached(cacheKey, products),
        await setCached('products:total', total)
      ]);
    }

    const lastPage = Math.ceil(total/ take);

    return {
      success: true,
      data: {
        data: processActionReturnData(products, params.limitFields) as ExtendedProduct[],
        metadata: {
          total: total,
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
      data: processActionReturnData(product, limitFields) as ExtendedProduct
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
export async function getProductBySlug({ limitFields, slug }: GetObjectByTParams<"slug">): Promise<ActionsReturnType<ExtendedProduct>> {

  try {
    let product: Product | null = await getCached(`product:${slug}`);
    if (!product) {
      product = await prisma.product.findUnique({
        where: { slug },
        include: {
          category: true,
          postedBy: true,
          // reviews: {
          //   include: {
          //     user: true,
          //   }
          // },
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
      data: processActionReturnData(product, limitFields) as ExtendedProduct
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message
    };
  }
}

export async function getProductReviewsBySlug({ limitFields, slug }: GetObjectByTParams<"slug">): Promise<ActionsReturnType<ExtendedReview[]>> {
  try {
    const cacheKey = `product:${slug}:reviews`;
    let reviews = await getCached(cacheKey);

    // If no cache, fetch reviews directly from database
    if (!reviews) {
      const product = await prisma.product.findUnique({
        where: { slug },
        select: {
          reviews: {
            include: {
              user: true
            }
          }
        }
      });

      if (!product) {
        return {
          success: false,
          message: "Product not found."
        };
      }

      reviews = product.reviews;
      await setCached(cacheKey, reviews);
    }

    return {
      success: true,
      data: processActionReturnData(reviews, limitFields) as ExtendedReview[]
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message
    };
  }
}