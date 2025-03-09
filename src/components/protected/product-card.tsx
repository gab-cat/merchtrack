'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart, ShoppingCart, Tag, StarHalf } from 'lucide-react';
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
    
  // Generate star rating display more accurately
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star 
          key={`full-${i}`} 
          className="size-4 fill-yellow-400 text-yellow-400"
        />
      );
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <StarHalf 
          key="half" 
          className="size-4 fill-yellow-400 text-yellow-400"
        />
      );
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star 
          key={`empty-${i}`} 
          className="size-4 text-gray-300"
        />
      );
    }
    
    return stars;
  };
  
  // Determine availability message based on inventory type and count
  const getAvailabilityMessage = () => {
    if (inventoryType === 'STOCK') {
      if (inventory <= 0) {
        return { text: 'Out of Stock', color: 'text-red-600' };
      } else if (inventory < 10) {
        return { text: `Only ${inventory} left!`, color: 'text-amber-600' };
      } else {
        return { text: 'In Stock', color: 'text-green-600' };
      }
    } else {
      // For pre-orders, always show as available
      return { text: 'Available for Pre-order', color: 'text-blue-600' };
    }
  };
  
  const availability = getAvailabilityMessage();
  
  return (
    <div className="group relative overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      {/* Badges with improved positioning */}
      <div className="absolute left-2 top-2 z-10 flex flex-wrap gap-1.5">
        {isBestPrice && (
          <Badge className="bg-green-600 hover:bg-green-700">
            Best Deal
          </Badge>
        )}
        
        {discountLabel && (
          <Badge variant="destructive">
            {discountLabel}
          </Badge>
        )}
        
        {inventoryType === 'PREORDER' && (
          <Badge variant="secondary" className="border-blue-400 bg-blue-50 text-blue-700 hover:bg-blue-100">
            Pre-order
          </Badge>
        )}
      </div>
      
      {/* Overlay buttons with improved styling */}
      <div className="absolute right-2 top-2 z-10 flex flex-col gap-2 opacity-0 transition-all duration-200 group-hover:opacity-100">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="secondary" className="size-9 rounded-full bg-white shadow-md hover:bg-gray-50">
                <Heart className="size-5 text-rose-500" />
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
              <Button size="icon" variant="secondary" className="size-9 rounded-full bg-white shadow-md hover:bg-gray-50">
                <ShoppingCart className="size-5 text-primary" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add to Cart</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Product Image with improved design */}
      <Link href={`/products/${slug}`} className="relative block overflow-hidden pt-[75%]">
        <div className="absolute inset-0 bg-gray-100" />
        <Image
          src={imageUrl?.[0] || '/img/placeholder.png'}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      
      {/* Product Info with improved spacing and typography */}
      <div className="p-5">
        {category && (
          <div className="text-muted-foreground mb-1.5 text-xs font-medium uppercase tracking-wide">
            {category.name}
          </div>
        )}
        
        <Link href={`/products/${slug}`} className="transition-colors hover:text-primary">
          <h3 className="mb-2 line-clamp-2 min-h-12 text-lg font-medium leading-snug" title={title}>
            {truncatedTitle}
          </h3>
        </Link>
        
        <div className="mb-3 flex items-center">
          <div className="flex items-center">
            {renderStars()}
            <span className="text-muted-foreground ml-1.5 text-xs font-medium">
              ({reviewsCount})
            </span>
          </div>
        </div>
        
        <div className="mb-4 text-lg font-semibold text-primary">
          {formattedPrice}
        </div>
        
        {/* Tags with improved design */}
        {tags && tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="px-2 py-0.5 text-xs">
                <Tag className="mr-1 size-3 opacity-70" />
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="px-2 py-0.5 text-xs">
                +{tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        {/* Inventory Status with improved design */}
        <div className="mt-auto flex items-center justify-between">
          <div className={`text-sm font-medium ${availability.color}`}>
            {availability.text}
          </div>
          <Link href={`/products/${slug}`}>
            <Button size="sm" variant="default">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}