'use client';

import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createOrUpdateReview, getUserReviewForProduct } from "@/actions/reviews.actions";
import { ExtendedReview } from "@/types/extended";
import { prettyFormatDate } from "@/utils/format";

interface UserReviewProps {
  userId: string | null;
  productId: string;
  onReviewSubmitted?: () => void;
}

export default function UserReview({ userId, productId, onReviewSubmitted }: UserReviewProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userReview, setUserReview] = useState<ExtendedReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user's existing review if any
  useEffect(() => {
    async function fetchUserReview() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const response = await getUserReviewForProduct(userId, productId);
        if (response.success && response.data) {
          setUserReview(response.data);
          // Pre-fill form if editing
          setRating(response.data.rating);
          setComment(response.data.comment || "");
        }
      } catch (error) {
        console.error("Failed to fetch user review:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserReview();
  }, [userId, productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error("You must be logged in to leave a review");
      return;
    }
    
    if (rating === 0) {
      toast.error("Please select a rating before submitting");
      return;
    }
    
    if (!comment.trim()) {
      toast.error("Please provide a comment for your review");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await createOrUpdateReview(userId, {
        productId,
        rating,
        comment
      });
      
      if (response.success) {
        setUserReview(response.data!);
        setIsEditing(false);
        toast.success("Review submitted successfully!");
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
      } else {
        toast.error(response.message || "Failed to submit review");
      }
    } catch (error) {
      toast.error("An error occurred while submitting your review");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-4 text-center">Loading review information...</div>;
  }

  if (!userId) {
    return <div className="py-4 text-center text-gray-500">Please log in to leave a review</div>;
  }

  // Show existing review if user has one and not editing
  if (userReview && !isEditing) {
    return (
      <div className="mb-8 rounded-lg border p-4">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h3 className="font-medium">Your Review</h3>
            <div className="mt-1 flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={`${
                    i < userReview.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-gray-500">
                Posted on {prettyFormatDate(userReview.createdAt)}
              </span>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditing(true)}
          >
            Edit Review
          </Button>
        </div>
        <p className="text-gray-700">{userReview.comment}</p>
      </div>
    );
  }

  // Show review form for new reviews or when editing
  return (
    <div className="mb-8">
      <h3 className="mb-4 font-semibold">
        {isEditing ? "Edit Your Review" : "Write a Review"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
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
        
        <div className="flex gap-2">
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : isEditing ? "Update Review" : "Submit Review"}
          </Button>
          
          {isEditing && (
            <Button 
              type="button"
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}