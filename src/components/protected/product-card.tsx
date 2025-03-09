'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, ShoppingCart, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ExtendedProduct } from '@/types/extended';


export default function ProductCard({
  slug,
  title,
  imageUrl,
  rating,
  reviewsCount,
  discountLabel,
  inventory,
  inventoryType,
  isBestPrice,
  variants,
  tags,
  category
}: Readonly<ExtendedProduct>) {
  // Get the lowest price from variants
  const lowestPrice = variants.length > 0
    ? variants.reduce((min, variant) => 
      variant.price < min ? variant.price : min, 
    variants[0].price
    )
    : 0;
    
  // Format the price with commas and two decimal places
  const formattedPrice = lowestPrice.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });
  
  // Truncate long titles
  const truncatedTitle = title.length > 50 
    ? `${title.substring(0, 50)}...` 
    : title;
    
  // Generate star rating display
  const ratingStars = Array(5).fill(0).map((_, i) => (
    <Star 
      key={i} 
      className={`size-4 ${i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
    />
  ));
  
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md">
      {/* Overlay buttons */}
      <div className="absolute right-2 top-2 z-10 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="secondary" className="size-8 rounded-full">
                <Heart className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add to Wishlist</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="secondary" className="size-8 rounded-full">
                <ShoppingCart className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add to Cart</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Badges */}
      <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
        {isBestPrice && (
          <Badge className="bg-green-600 hover:bg-green-700">
            Best Price
          </Badge>
        )}
        
        {discountLabel && (
          <Badge variant="destructive">
            {discountLabel}
          </Badge>
        )}
        
        {inventoryType === 'PREORDER' && (
          <Badge variant="outline">
            Pre-order
          </Badge>
        )}
      </div>
      
      {/* Product Image */}
      <Link href={`/products/${slug}`} className="relative block overflow-hidden pt-[75%]">
        <Image
          src={imageUrl?.[0] || '/img/placeholder.png'}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      
      {/* Product Info */}
      <div className="p-4">
        {category && (
          <div className="text-muted-foreground mb-1 text-xs">
            {category.name}
          </div>
        )}
        
        <Link href={`/products/${slug}`} className="hover:underline">
          <h3 className="mb-1 line-clamp-2 text-lg font-medium" title={title}>
            {truncatedTitle}
          </h3>
        </Link>
        
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {ratingStars}
            <span className="text-muted-foreground ml-1 text-xs">
              ({reviewsCount})
            </span>
          </div>
          <div className="font-semibold text-primary">
            {formattedPrice}
          </div>
        </div>
        
        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                <Tag className="mr-1 size-3" />
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        {/* Inventory Status */}
        <div className="mt-3 flex items-center justify-between">
          <div className="text-sm">
            {inventory > 0 ? (
              inventoryType === 'STOCK' ? (
                inventory < 10 ? (
                  <span className="text-amber-600">Only {inventory} left!</span>
                ) : (
                  <span className="text-green-600">In Stock</span>
                )
              ) : (
                <span className="text-blue-600">Pre-order Available</span>
              )
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )}
          </div>
          <Button size="sm" variant="outline">
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}