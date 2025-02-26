import React from "react";
// import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import { Button } from "@/components/ui/button";
import SizeSelector from "@/components/ui/size-selector";
import QuantitySelector from "@/components/ui/quantity-selector";
import { getProductBySlug } from "@/actions/products.actions";
import { ExtendedProductVariant } from "@/types/extended";

import "./embla.css";

import EmblaCarousel from '@/components/ui/EmblaCarousel';
 
// import { Card, CardContent } from "@/components/ui/card";
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from "@/components/ui/embla-carousel";

interface ProductListingProps {
    variants: ExtendedProductVariant[];
    slug: string;
}

const ProductListing: React.FC<ProductListingProps> = async ({ slug }) => {
  const { data } = await getProductBySlug({
    userId: '',
    slug: slug,
  });

  // const SLIDE_COUNT = 10;
  // const SLIDES = Array.from(Array(SLIDE_COUNT).keys());

  // const data = {
  //   imageUrl : ['/img/profile-placeholder-img.png', '/img/profile-placeholder-img.png', '/img/profile-placeholder-img.png'],
  //   title: "Lemon",
  //   description: "<p> Manok ako eh ano ka?</p>",
  //   variants:[{"id":"1",variantName:"Male"}, {"id":"2",variantName:"Female"}]
    
  // };



  return (
    <div className="mx-auto my-10 mt-20 flex max-w-5xl flex-1 flex-col items-stretch gap-16  rounded-lg bg-white p-6 shadow-sm md:flex-row">
      {/* Left Column - Image */}
      <div className="relative flex h-auto w-full justify-center overflow-hidden md:w-1/2">

        <EmblaCarousel slides={[...(data?.imageUrl ?? []), "/img/profile-placeholder-img.png"]}/>

        {/* <Carousel className="w-full max-w-fit">
          <CarouselContent>
            {data?.imageUrl.map((url, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-square items-center justify-center p-6">
                      <img src={url} alt="product-image" className="size-full object-contain"/>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel> */}

        
      </div>

      {/* Right Column - Text & Button */}
      <div className="flex flex-1 flex-col gap-4 px-10 text-left  md:text-left">

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