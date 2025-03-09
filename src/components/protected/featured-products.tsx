'use client';

import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/protected/product-card';
import { ExtendedProduct } from '@/types/extended';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface FeaturedProductsProps {
  products: ExtendedProduct[];
  title?: string;
}

export default function FeaturedProducts({ products, title = 'Featured Products' }: Readonly<FeaturedProductsProps>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [swiperInstance, setSwiperInstance] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if we're on the client side before accessing window
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768);
      };
      
      checkMobile();
      window.addEventListener('resize', checkMobile);
      
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="relative mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        {!isMobile && (
          <div className="flex gap-2">
            <button
              className="flex size-10 items-center justify-center rounded-full border border-gray-300 transition-colors hover:bg-gray-100"
              onClick={() => swiperInstance?.slidePrev()}
              aria-label="Previous product"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              className="flex size-10 items-center justify-center rounded-full border border-gray-300 transition-colors hover:bg-gray-100"
              onClick={() => swiperInstance?.slideNext()}
              aria-label="Next product"
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        )}
      </div>

      <Swiper
        onSwiper={setSwiperInstance}
        slidesPerView={1}
        spaceBetween={16}
        modules={[Navigation, Pagination, Autoplay]}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          dynamicBullets: true,
          clickable: true,
        }}
        breakpoints={{
          500: {
            slidesPerView: 2,
            spaceBetween: 16,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 20,
          },
        }}
        className="pb-12"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <ProductCard {...product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}