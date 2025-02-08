"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { Heart, Star, Eye } from "lucide-react";
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

export function ProductCard({ product }: Readonly<{ product: ExtendedProduct }>) {
  const [isHovered, setIsHovered] = useState(false);
  const basePrice = product.variants[0]?.price || 0;
  const priceRange =
    product.variants.length > 1
      ? `${formatCurrency(Math.min(...product.variants.map((v) => Number(v.price))))} - ${formatCurrency(Math.max(...product.variants.map((v) => Number(v.price))))}`
      : formatCurrency(basePrice);

  return (
    <motion.div {...fadeInUp} >
      <Card className="group overflow-hidden rounded-md shadow-none">
        <div
          role="button"
          tabIndex={0}
          className="relative aspect-square"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsHovered(true);
            }
          }}
          onKeyUp={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setIsHovered(false);
            }
          }}
          aria-label="View product details"
        >
          <Image
            src={product.imageUrl[0] || "/placeholder.png"}
            alt={product.title}
            fill
            className="aspect-square object-cover transition-transform"
          />
          {isHovered && (
            <motion.div {...fadeIn} className="absolute inset-0 flex items-center justify-center bg-black/40 transition-all">
              <Button variant="default" size="sm" className="mr-2 text-white">
                <Link className="flex items-center" href={`/admin/inventory/${product.slug}`} passHref>
                  <Eye className="mr-2 size-4" />
                  Quick View
                </Link>
              </Button>
            </motion.div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 bg-white/80 hover:bg-white"
          >
            <Heart className="size-4" />
          </Button>
        </div>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="truncate text-lg font-bold text-primary">{product.title}</h3>
            </div>
            <div className="flex items-center justify-between">
              <p className="font-bold text-primary">{priceRange}</p>
              {product.category && (
                <Badge  className="text-xs text-white">
                  {product.category.name}
                </Badge>
              )}
            </div>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`size-4 ${
                    star <= Math.round(product.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                  }`}
                />
              ))}
              <span className="text-muted-foreground ml-2 text-sm">({product.reviews.length ?? 0})</span>
            </div>
          </div>

          {product.description && (
            <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }} className="text-muted-foreground mt-2 line-clamp-3 text-sm" />
          )}

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <Badge variant={product.inventory > 0 ? "default" : "destructive"} className={cn("text-xs underline", product.inventory <= 0 ? "text-primary" : "text-white")}>
                {product.inventory > 0 || product.inventoryType === "PREORDER" ? "In Stock" : "Out of Stock"}
              </Badge>
              <span className="rounded-md border bg-neutral-2 px-3 py-1 text-xs font-normal">{product.inventoryType.toString()}</span>
            </div>

            {product.variants.length > 0 && (
              <div className="mb-2 flex flex-wrap items-center gap-1">
                <SlOptionsVertical className="size-4 text-primary" />
                {product.variants.slice(0, 3).map((variant) => (
                  <Badge key={variant.id} variant="outline" className="text-xs">
                    {variant.variantName}
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
              <div className="flex flex-wrap items-center gap-1 text-primary">
                <FaTags className="size-4 text-primary" />
                {product.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="default" className="border-primary bg-white text-xs">
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

