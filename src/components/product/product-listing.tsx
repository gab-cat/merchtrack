'use client';

import React, { useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import { FaCartPlus } from "react-icons/fa";
import { toast } from 'sonner';
import ProductReviewsRecommendations from "./product-reviews-recommendations";
import { Button } from "@/components/ui/button";
import QuantitySelector from "@/components/ui/quantity-selector";
import { useCartStore } from "@/stores/cart.store";
import "./embla.css";
import EmblaCarousel from '@/components/ui/EmblaCarousel';
import type { ExtendedProduct, ExtendedProductVariant } from "@/types/extended";
import { useReviewsBySlugQuery } from "@/hooks/reviews.hooks";

interface ProductListingProps {
  slug: string;
  product: ExtendedProduct;
}

const ProductListing: React.FC<ProductListingProps> = ({ slug, product }) => {
  const { addItem, setCartOpen } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  // Fetch product reviews
  const { data: reviews } = useReviewsBySlugQuery(slug);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    
    const variant = product.variants.find((v) => v.id === selectedVariant);
    if (!variant) return;

    // Validate inventory
    if (variant.inventory < quantity) {
      toast.error('Not enough stock available');
      return;
    }

    addItem({
      variantId: variant.id,
      quantity,
      variant: {
        ...variant,
        product: {
          title: product.title,
          imageUrl: product.imageUrl
        }
      }
    });

    toast.success('Added to cart!');
    setCartOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Product Images */}
        <div>
          <EmblaCarousel 
            slides={product.imageUrl}
          />
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-2xl font-bold">{product.title}</h1>
          <div className="mt-4">
            <div dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(product.description ?? '') 
            }} />
          </div>

          <h3 className="mt-[20px] font-bold">Select Variant</h3>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {product.variants.map((variant: ExtendedProductVariant) => {
              const isOutOfStock = variant.inventory === 0;
              return (
                <Button
                  key={variant.id}
                  variant={selectedVariant === variant.id ? "default" : "outline"}
                  onClick={() => setSelectedVariant(variant.id)}
                  disabled={isOutOfStock}
                  className="relative"
                >
                  <span className="flex flex-col">
                    <span>{variant.variantName}</span>
                    <span className="text-sm">₱{Number(variant.price).toFixed(2)}</span>
                  </span>
                  {isOutOfStock && (
                    <span className="absolute bottom-1 right-1 text-xs text-red-500">
                      Out of Stock
                    </span>
                  )}
                </Button>
              );
            })}
          </div>

          <h3 className="mt-[20px] font-bold">Quantity</h3>
          <div className="mt-2">
            <QuantitySelector
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={selectedVariant ? Math.min(10, product.variants.find(v => v.id === selectedVariant)?.inventory || 10) : 10}
            />
          </div>

          <div className="mt-4">
            <Button 
              className="w-full" 
              onClick={handleAddToCart}
              disabled={!selectedVariant}
            >
              <FaCartPlus className="mr-2" /> Add to Cart
            </Button>
          </div>
        </div>
      </div>
      <ProductReviewsRecommendations slug={slug} reviews={reviews!} />
    </>
  );
};

export default ProductListing;