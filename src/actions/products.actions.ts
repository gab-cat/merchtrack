'use server';

import { Product } from "@prisma/client";
import prisma from "@/lib/db";
import { getCached, setCached } from "@/lib/redis";
import { QueryParams, PaginatedResponse } from "@/types/common";
import { ExtendedProduct, GetObjectByTParams } from "@/types/extended";
import { verifyPermission } from "@/utils/permissions";
import { calculatePagination, removeFields } from "@/utils/query.utils";


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
      
      await setCached(`products:${page}:${take}`, products);
      await setCached('products:total', total);
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
