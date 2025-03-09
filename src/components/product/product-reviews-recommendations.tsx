"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";
import ProductRecommendations from "./product-recommendations";
import ProductReviews from "./product-reviews";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ExtendedReview } from "@/types/extended";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import useToast from "@/hooks/use-toast";

interface RecommendedProduct {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  slug: string;
}

interface ProductReviewsRecommendationsProps {
  reviews?: ExtendedReview[];
  recommendedProducts?: RecommendedProduct[];
  onReviewSubmit?: (review: { rating: number; comment: string }) => Promise<void>;
  slug: string;
}

export default function ProductReviewsRecommendations({
  onReviewSubmit,
  slug
}: Readonly<ProductReviewsRecommendationsProps>) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast  = useToast;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Rating required",
        message: "Please select a rating before submitting",
        type: "error",
      });
      return;
    }
    
    if (!comment.trim()) {
      toast({
        title: "Comment required",
        message: "Please provide a comment for your review",
        type: "error",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (onReviewSubmit) {
        await onReviewSubmit({ rating, comment });
      }
      
      setRating(0);
      setComment("");
      
      toast({
        title: "Review submitted",
        message: "Thank you for your feedback!",
        type: "success",
      });
    } catch {
      toast({
        title: "Error",
        message: "Failed to submit review. Please try again.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto mt-16 w-full max-w-5xl">
      <Tabs defaultValue="reviews" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="recommended">You Might Also Like</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reviews">
          <Card className="border-none shadow-none">
            <CardContent className="pt-6">
              <h3 className="mb-4 text-xl font-semibold">Write a Review</h3>
              <form onSubmit={handleSubmit} className="mb-8 space-y-4 border-b pb-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Rating</p>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={24}
                        className={`cursor-pointer ${
                          i < (hoverRating || rating) 
                            ? "fill-yellow-400 text-yellow-400" 
                            : "text-gray-300"
                        }`}
                        onClick={() => setRating(i + 1)}
                        onMouseEnter={() => setHoverRating(i + 1)}
                        onMouseLeave={() => setHoverRating(0)}
                      />
                    ))}
                    <span className="ml-2 text-sm text-gray-500">
                      {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select rating'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="comment" className="text-sm font-medium">
                    Your Review
                  </label>
                  <Textarea
                    id="comment"
                    placeholder="Share your thoughts about this product..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="mt-2" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
              
              <h3 className="mb-4 text-xl font-semibold">Customer Reviews</h3>
              <ProductReviews slug= {slug}/>





              {/* {reviews.length === 0 ? (
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
              )} */}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="recommended">
          <ProductRecommendations />
        </TabsContent>
      </Tabs>
    </div>
  );
}
