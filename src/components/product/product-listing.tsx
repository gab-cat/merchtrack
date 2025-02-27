import React from "react";
import DOMPurify from "isomorphic-dompurify";
import { Button } from "@/components/ui/button";
import SizeSelector from "@/components/ui/size-selector";
import QuantitySelector from "@/components/ui/quantity-selector";
import { getProductBySlug } from "@/actions/products.actions";
import "./embla.css";
import EmblaCarousel from '@/components/ui/EmblaCarousel';
import { FaCartPlus } from "react-icons/fa";
import ProductReviewsRecommendations from "./product-reviews-recommendations";

interface ProductListingProps {
    slug: string;
}

const ProductListing: React.FC<ProductListingProps> = async ({ slug }) => {
  const { data } = await getProductBySlug({
    userId: '',
    slug: slug,
  });

  return (
    <>
      <div className="mx-auto my-10 mt-20 flex max-w-5xl flex-1 flex-col items-stretch gap-16 rounded-lg bg-white p-6 md:flex-row">
        {/* Left Column - Image */}
        <div className="flex w-full md:w-1/2">
          <EmblaCarousel slides={data?.imageUrl ?? []} />
        </div>

        {/* Right Column - Text & Button */}
        <div className="flex flex-1 flex-col gap-4 text-left md:px-6">
          <h1 className="text-4xl font-bold text-gray-900">{data?.title}</h1>
          <h1 className="text-4xl text-gray-900">₱ 450.00</h1>
          {(data?.description) && <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data?.description) }}></p>}
          <h3 className="mt-[20px] font-bold">Options</h3>
          <SizeSelector variants={data?.variants || []} />
          <h3 className="mt-[20px] font-bold">Quantity</h3>
          <QuantitySelector />
          <div className="flex">
            <Button className="w-full"><FaCartPlus className="mr-2" /> Add to Cart</Button>
          </div>
        </div>
      </div>
      <ProductReviewsRecommendations productId={data!.id} reviews={data?.reviews} />
    </>
  );
};

export default ProductListing;