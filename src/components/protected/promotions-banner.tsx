'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Promotion {
  id: string;
  title: string;
  description: string;
  code?: string;
  expiryDate?: string;
  ctaText: string;
  ctaLink: string;
  color: string;
}

interface PromotionsBannerProps {
  promotions: Promotion[];
}

export default function PromotionsBanner({ promotions = [] }: Readonly<PromotionsBannerProps>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  // If no promotions or banner dismissed, don't render
  if (promotions.length === 0 || isDismissed) {
    return null;
  }

  const currentPromotion = promotions[currentIndex];

  // Determine background color based on the promotion color
  const getBgColor = (color: string) => {
    const colors: Record<string, string> = {
      'blue': 'bg-blue-100 border-blue-300',
      'green': 'bg-green-100 border-green-300',
      'red': 'bg-red-100 border-red-300',
      'amber': 'bg-amber-100 border-amber-300',
      'purple': 'bg-purple-100 border-purple-300',
      'pink': 'bg-pink-100 border-pink-300',
      'default': 'bg-gray-100 border-gray-300'
    };
    
    return colors[color] || colors.default;
  };
  
  // Format the date in a human-readable format
  const formatExpiryDate = (dateStr?: string) => {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };


  return (
    <div className={`relative border px-4 py-3 ${getBgColor(currentPromotion.color)} rounded-md shadow-sm`}>
      {/* Close button */}
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
        aria-label="Dismiss promotion"
      >
        <X size={18} />
      </button>
      
      {/* Promotion content */}
      <div className="flex flex-col items-center justify-between md:flex-row">
        <div className="mb-3 text-center md:mb-0 md:text-left">
          <h3 className="text-lg font-semibold">{currentPromotion.title}</h3>
          <p className="mb-2 text-sm">{currentPromotion.description}</p>
          
          {currentPromotion.code && (
            <div className="inline-block rounded-md border bg-white px-3 py-1 font-mono text-sm">
              {currentPromotion.code}
            </div>
          )}
          
          {currentPromotion.expiryDate && (
            <p className="mt-1 text-xs text-gray-600">
              Expires on {formatExpiryDate(currentPromotion.expiryDate)}
            </p>
          )}
        </div>
        
        <Button asChild>
          <Link href={currentPromotion.ctaLink}>
            {currentPromotion.ctaText}
          </Link>
        </Button>
      </div>
      
      {/* Promotion navigation (only show if multiple promotions) */}
      {promotions.length > 1 && (
        <div className="mt-2 flex justify-center gap-1">
          {promotions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`size-2 rounded-full ${
                index === currentIndex ? 'bg-primary' : 'bg-gray-300'
              }`}
              aria-label={`Go to promotion ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}