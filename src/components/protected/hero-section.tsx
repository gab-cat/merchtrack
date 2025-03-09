'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSlide {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
}

interface HeroSectionProps {
  slides?: HeroSlide[];
}

// Default hero slides if none provided
const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 1,
    title: "Discover Premium Merchandise",
    description: "Explore our exclusive collection of high-quality products at unbeatable prices",
    imageUrl: "/img/carousel-img.png",
    buttonText: "Shop Now",
    buttonLink: "/products"
  },
  {
    id: 2,
    title: "Track Your Orders Seamlessly",
    description: "Real-time updates on your purchases from shipment to delivery",
    imageUrl: "/img/carousel-image.jpg",
    buttonText: "Track Orders",
    buttonLink: "/track-order"
  }
];

export default function HeroSection({ slides = DEFAULT_SLIDES }: HeroSectionProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  
  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <section className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`flex flex-col items-center gap-6 transition-opacity duration-500 md:flex-row ${
              activeSlide === index ? "opacity-100" : "hidden opacity-0"
            }`}
          >
            {/* Content */}
            <div className="mb-6 w-full space-y-4 md:mb-0 md:w-1/2 md:space-y-6">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl lg:text-5xl">
                {slide.title}
              </h1>
              <p className="max-w-xl text-base text-gray-600 md:text-lg">
                {slide.description}
              </p>
              <div className="flex gap-4">
                <Button size="lg" asChild>
                  <Link href={slide.buttonLink}>
                    {slide.buttonText}
                    <ChevronRight className="ml-2 size-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/my-account">My Account</Link>
                </Button>
              </div>
            </div>
            
            {/* Image - Fixed to show full image */}
            <div className="flex w-full items-center justify-center md:w-1/2">
              <div className="relative aspect-square w-full md:aspect-[4/3]">
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Slide indicators */}
      <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveSlide(index)}
            className={`size-3 rounded-full ${
              activeSlide === index ? "bg-primary" : "bg-gray-300"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}