"use client";

import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { ExtendedReview } from "@/types/extended";
import { prettyFormatDate } from "@/utils/format";
import { getProductReviewsBySlug } from "@/actions/products.actions";
import ProductReviewsSkeleton from "@/components/product/product-reviews-skeleton";

interface ProductReviewsProps {
  slug: string;
}

export default function ProductReviews({ slug }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ExtendedReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await getProductReviewsBySlug({
          slug: slug
        });

        if (response.success && response.data) {
          setReviews(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [slug]);

  if (loading) {
    return <ProductReviewsSkeleton />;
  }

  return (
    <>
      {reviews.length === 0 ? (
        <p>No reviews yet. Be the first to review this product!</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-4 last:border-b-0">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center">
                  <p className="mr-3 font-medium">{review.user.firstName} {review.user.lastName}</p>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={`${
                          i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-500">{prettyFormatDate(review.createdAt)}</p>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}