"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { Star, Eye } from "lucide-react";
import { FaTags } from "react-icons/fa";
import { SlOptionsVertical } from "react-icons/sl";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ExtendedProduct } from "@/types/extended";
import { formatCurrency } from "@/utils/formatCurrency";
import { fadeIn, fadeInUp } from "@/constants/animations";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  product: ExtendedProduct;
  isHovered: boolean;
  onHoverChange: (hover: boolean) => void;
}

function ProductImage({ product, isHovered, onHoverChange }: Readonly<ProductImageProps>) {
  return (
    <div
      role="button"
      tabIndex={0}
      className="relative aspect-square"
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onHoverChange(true);
      }}
      onKeyUp={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onHoverChange(false);
      }}
      aria-label="View product details"
    >
      <Image
        src={product.imageUrl[0] || "/placeholder.png"}
        alt={product.title}
        fill
        className="aspect-square object-cover transition-transform group-hover:scale-105"
      />
      {isHovered && (
        <motion.div {...fadeIn} className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
          <Button variant="default" size="sm" className="mr-2 bg-white text-primary hover:bg-white/90">
            <Link className="flex items-center" href={`/admin/inventory/${product.slug}`} passHref>
              <Eye className="mr-2 size-4" />
              Quick View
            </Link>
          </Button>
        </motion.div>
      )}
    </div>
  );
}

interface ProductRatingProps {
  rating: number;
  reviewCount: number;
}

function ProductRating({ rating, reviewCount }: Readonly<ProductRatingProps>) {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`size-4 ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
      <span className="text-muted-foreground ml-2 text-sm">({reviewCount})</span>
    </div>
  );
}

export function ProductCard({ product }: Readonly<{ product: ExtendedProduct }>) {
  const [isHovered, setIsHovered] = useState(false);
  const basePrice = product.variants[0]?.price || 0;
  const priceRange =
    product.variants.length > 1
      ? `${formatCurrency(Math.min(...product.variants.map((v) => Number(v.price))))} - ${formatCurrency(Math.max(...product.variants.map((v) => Number(v.price))))}`
      : formatCurrency(basePrice);
  
  const averageRating = product.reviews.length > 0
    ? Math.round(product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length)
    : 0;

  const showOutOfStock = product.inventoryType === "STOCK" && product.inventory <= 0;

  return (
    <motion.div {...fadeInUp}>
      <Card className="group overflow-hidden rounded-md border border-neutral-200 shadow-sm transition-all hover:shadow-md">
        <ProductImage 
          product={product} 
          isHovered={isHovered}
          onHoverChange={setIsHovered}
        />
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="truncate text-lg font-bold text-primary">{product.title}</h3>
            </div>
            <div className="flex items-center justify-between">
              <p className="font-bold text-primary">{priceRange}</p>
              {product.category && (
                <Badge className="text-xs text-white">
                  {product.category.name}
                </Badge>
              )}
            </div>
            <ProductRating rating={averageRating} reviewCount={product.reviews.length} />
          </div>

          {product.description && (
            <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }} className="text-muted-foreground mt-2 line-clamp-3 text-sm" />
          )}

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <Badge 
                variant={showOutOfStock ? "destructive" : "default"} 
                className={cn(
                  "text-xs", 
                  showOutOfStock ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                )}
              >
                {showOutOfStock ? "Out of Stock" : "Available"}
              </Badge>
              <span className="rounded-md border bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700">
                {product.inventoryType === "PREORDER" ? "Pre-order" : "In Stock"}
              </span>
            </div>

            {product.variants.length > 0 && (
              <div className="mb-2 flex flex-wrap items-center gap-1">
                <SlOptionsVertical className="size-4 text-primary" />
                {product.variants.slice(0, 3).map((variant) => (
                  <Badge key={variant.id} variant="outline" className="flex items-center gap-1 text-xs">
                    {variant.variantName}
                    <span className="text-muted-foreground ml-1 text-xs">
                      ({variant.inventory} in stock)
                    </span>
                  </Badge>
                ))}
                {product.variants.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{product.variants.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {product.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                <FaTags className="size-4 text-primary" />
                {product.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {product.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{product.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

