'use client';

import { useEffect, useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import { FaCartPlus } from "react-icons/fa";
import { toast } from "sonner";
import ProductRecommendations from "./product-recommendations";
import UserReview from "./user-review";
import ProductReviews from "./product-reviews";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/stores/user.store";
import { useCartStore } from "@/stores/cart.store";
import QuantitySelector from "@/components/ui/quantity-selector";
import "./embla.css";
import EmblaCarousel from '@/components/ui/EmblaCarousel';
import { ExtendedProduct, ExtendedProductVariant } from "@/types/extended";
import { useRolePricing } from "@/hooks/use-role-pricing";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

interface ProductListingProps {
  product: ExtendedProduct;
  slug: string;
}

const ProductListing: React.FC<ProductListingProps> = ({ product, slug }) => {
  const { user } = useUserStore();
  const { addItem, setCartOpen } = useCartStore();
  const [selectedVariant, setSelectedVariant] = useState<ExtendedProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [refreshReviews, setRefreshReviews] = useState(false);

  useEffect(() => {
    if (product?.variants?.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  const pricingDetails = useRolePricing({
    variant: {
      ...selectedVariant,
      price: selectedVariant?.price?.toString() ?? "0",
      rolePricing: selectedVariant?.rolePricing ?? {},
    },
    customerRole: user?.role ?? null,
    customerCollege: user?.college ?? null,
    productPostedByCollege: product?.postedBy?.college ?? null
  });

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Please select a variant");
      return;
    }

    addItem({
      variantId: selectedVariant.id,
      quantity,
      // @ts-expect-error - We're passing the variant object as the cart item object
      variant: {
        ...selectedVariant,
        product: {
          title: product.title,
          imageUrl: product.imageUrl,
        }
      }
    });

    toast.success('Added to cart!');
    setCartOpen(true);
  };

  const handleReviewSubmitted = () => {
    setRefreshReviews(prev => !prev);
  };

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <>
      <div className="mx-auto my-10 mt-20 flex max-w-5xl flex-1 flex-col items-stretch gap-16 rounded-lg bg-white p-6 md:flex-row">
        {/* Left Column - Image */}
        <div className="flex w-full md:w-1/2">
          <EmblaCarousel slides={product?.imageUrl ?? []} />
        </div>

        {/* Right Column - Text & Button */}
        <div className="flex flex-1 flex-col gap-4 text-left md:px-6">
          <h1 className="text-4xl font-bold text-gray-900">{product?.title}</h1>
          
          <div className="space-y-2">
            {selectedVariant && (
              <>
                <div className="flex items-center justify-between">
                  <h1 className="text-4xl text-gray-900">{pricingDetails.formattedPrice}</h1>
                </div>
                {pricingDetails.appliedRole !== "OTHERS" && (
                  <p className="text-sm text-green-600">
                    Special pricing for {pricingDetails.appliedRole.toLowerCase().replace('_', ' ')}
                  </p>
                )}
                {pricingDetails.price && (
                  <p className="text-sm text-gray-500 line-through">
                    Original price: {pricingDetails.originalPrice}
                  </p>
                )}
              </>
            )}
          </div>

          {product?.description && (
            <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }}></p>
          )}
          
          <h3 className="mt-[20px] font-bold">Options</h3>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {product?.variants.map((variant) => {
              const variantPricing = useRolePricing({
                // @ts-expect-error - We're passing the variant object as the rolePricing object
                variant,
                customerRole: user?.role ?? null,
                customerCollege: user?.college ?? null,
                productPostedByCollege: product?.postedBy?.college ?? null
              });

              const isOutOfStock = variant.inventory === 0 && product.inventoryType === 'STOCK';
              return (
                <Button
                  key={variant.id}
                  variant={selectedVariant?.id === variant.id ? "default" : "outline"}
                  onClick={() => setSelectedVariant(variant)}
                  disabled={isOutOfStock}
                  className="relative"
                >
                  <span className="flex flex-col">
                    <span>{variant.variantName}</span>
                    <span className="text-sm">{variantPricing.formattedPrice}</span>
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
          <QuantitySelector 
            value={quantity}
            onChange={setQuantity}
            min={1}
            max={selectedVariant ? Math.min(10, selectedVariant.inventory) : 10}
          />
          
          <div className="flex">
            <Button 
              className="w-full bg-primary text-white hover:bg-primary/90"
              onClick={handleAddToCart}
              disabled={!selectedVariant}
            >
              <FaCartPlus className="mr-2" /> Add to Cart
            </Button>
          </div>
        </div>
      </div>

      {/* Reviews and Recommendations */}
      <div className="mx-auto mt-16 w-full max-w-5xl">
        <Tabs defaultValue="reviews" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="recommended">You Might Also Like</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reviews">
            <Card className="border-none shadow-none">
              <CardContent className="pt-6">
                {/* User Review Form or Existing Review */}
                {user ? (
                  <UserReview 
                    userId={user.id} 
                    productId={product.id} 
                    onReviewSubmitted={handleReviewSubmitted}
                  />
                ) : (
                  <div className="mb-8 rounded-lg bg-gray-50 p-4 text-center">
                    <p>Please sign in to leave a review.</p>
                  </div>
                )}
                
                <h3 className="mb-4 text-xl font-semibold">Customer Reviews</h3>
                <ProductReviews slug={slug} key={refreshReviews ? 'refresh' : 'initial'} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recommended">
            <ProductRecommendations />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default ProductListing;