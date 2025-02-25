import React from "react";
// import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import { Button } from "@/components/ui/button";
import SizeSelector from "@/components/ui/size-selector";
import QuantitySelector from "@/components/ui/quantity-selector";
import { getProductBySlug } from "@/actions/products.actions";
import { ExtendedProductVariant } from "@/types/extended";
import Carousel from "@/components/ui/carousel";

interface ProductListingProps {
    variants: ExtendedProductVariant[];
    slug: string;
}

const ProductListing: React.FC<ProductListingProps> = async ({ slug }) => {
  const { data } = await getProductBySlug({
    userId: '',
    slug: slug,
  });

  //   const data = {
  //     imageUrl : [],
  //     title: "Lemon",
  //     description: "<h4>Wow<h4><p> Manok ako eh ano ka?<p>",
  //     variants:[{"id":"1",variantName:"Male"}, {"id":"2",variantName:"Female"}]
    
  //   };



  return (
    <div className="mt-20 flex flex-col items-center gap-6 rounded-lg border bg-white p-6 shadow-sm md:flex-row">
      {/* Left Column - Image */}
      <div className="relative flex h-auto w-full justify-center overflow-hidden md:w-1/2">
        {/* <div className="aspect-square"> */}
        <Carousel images={data?.imageUrl  || ['/img/profile-placeholder-img.png']} />
        {/* </div> */}
      </div>

      {/* Right Column - Text & Button */}
      <div className="flex flex-col justify-center gap-4 px-10 text-center md:w-1/2 md:text-left">

        <h1 className="text-4xl font-bold text-gray-900">{data?.title}</h1>
        <h1 className="text-4xl text-gray-900">₱ 450.00</h1>
        <h3 className="mt-[20px] font-bold" >Description</h3>
        {(data?.description) &&  <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(data?.description) }}></p>}
        <h3 className="mt-[20px] font-bold" >Size</h3> {/* Make this a widget */}
        <SizeSelector variants={data?.variants || []} />
        <h3 className="mt-[20px] font-bold" >Quantity</h3> {/* Make this a widget */}
        <QuantitySelector />
        <div className="flex">
          <Button className="w-full">Add to Cart</Button>
        </div>

      </div>
    </div>

  );
};

export default ProductListing;