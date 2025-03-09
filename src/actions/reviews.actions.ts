'use server';

import { z } from "zod";
import prisma from "@/lib/db";
import { processActionReturnData } from "@/utils";
import { ExtendedReview } from "@/types/extended";

// Schema for review creation
const createReviewSchema = z.object({
  productId: z.string({
    required_error: "Product ID is required",
  }),
  rating: z.number()
    .int("Rating must be a whole number")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),
  comment: z.string().min(3, "Comment must be at least 3 characters long"),
});

type CreateReviewType = z.infer<typeof createReviewSchema>;

/**
 * Create or update a product review
 */
export async function createOrUpdateReview(
  userId: string,
  data: CreateReviewType
): Promise<ActionsReturnType<ExtendedReview>> {
  if (!userId) {
    return {
      success: false,
      message: "You must be logged in to leave a review."
    };
  }

  try {
    // Validate the data
    const validatedData = createReviewSchema.parse(data);
    
    // Check if user already has a review for this product
    const existingReview = await prisma.review.findFirst({
      where: {
        productId: validatedData.productId,
        userId: userId
      }
    });

    let review;
    
    if (existingReview) {
      // Update existing review
      review = await prisma.review.update({
        where: {
          id: existingReview.id
        },
        data: {
          rating: validatedData.rating,
          comment: validatedData.comment,
          updatedAt: new Date()
        },
        include: {
          user: true
        }
      });
    } else {
      // Create new review
      review = await prisma.review.create({
        data: {
          productId: validatedData.productId,
          userId: userId,
          rating: validatedData.rating,
          comment: validatedData.comment
        },
        include: {
          user: true
        }
      });
      
      // Update product's rating and reviewsCount
      const product = await prisma.product.findUnique({
        where: { id: validatedData.productId },
        include: {
          reviews: true
        }
      });
      
      if (product) {
        const avgRating = product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length;
        
        await prisma.product.update({
          where: { id: validatedData.productId },
          data: {
            rating: avgRating,
            reviewsCount: product.reviews.length
          }
        });
      }
    }

    // Invalidate cache
    // const product = await prisma.product.findUnique({
    //   where: { id: validatedData.productId },
    //   select: { slug: true }
    // });
    
    // if (product) {
    //   await Promise.all([
    //     invalidateCache([
    //       `product:${validatedData.productId}`,
    //       `product:${product.slug}`,
    //       `product:${product.slug}:reviews`
    //     ])
    //   ]);
    // }

    return {
      success: true,
      data: processActionReturnData(review) as ExtendedReview
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create review"
    };
  }
}

/**
 * Get a user's review for a specific product
 */
export async function getUserReviewForProduct(
  userId: string,
  productId: string
): Promise<ActionsReturnType<ExtendedReview | null>> {
  if (!userId) {
    return {
      success: false,
      message: "User ID is required"
    };
  }

  try {
    const review = await prisma.review.findFirst({
      where: {
        productId,
        userId
      },
      include: {
        user: true
      }
    });

    return {
      success: true,
      data: review ? (processActionReturnData(review) as ExtendedReview) : null
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to get user review"
    };
  }
}