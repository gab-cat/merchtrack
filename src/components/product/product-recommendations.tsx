"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useProductsQuery } from "@/hooks/products.hooks";
import { ExtendedProduct } from "@/types/extended";


export default function ProductRecommendations() {
  const { data: recommendedProducts } = useProductsQuery({
    limit: 6, 
    take: 6,
    orderBy: {
      createdAt: "desc",
    }
  });

  // Function to render star ratings
  const renderRating = (rating: number) => {
    return (
      <div className="mt-1 flex items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={16}
            className={`${
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Card className="border-none shadow-none">
        <CardContent className="pt-6">
          <h3 className="mb-4 text-xl font-semibold">Recommended Products</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {recommendedProducts?.data?.map((product: ExtendedProduct) => {
              const rating = product.reviews?.reduce((acc, review) => acc + review.rating, 0) / product.reviews?.length;
              return (
                <Link href={`/products/${product.slug}`} key={product.id}>
                  <div className="group cursor-pointer">
                    <div className="relative mb-2 aspect-square overflow-hidden rounded-md">
                      <Image
                        src={product.imageUrl[0]}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <h4 className="font-medium">{product.title}</h4>
                    {rating > 0 && renderRating(rating)}
                    <p className="mt-1 text-gray-700">$0</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </>
  );
}