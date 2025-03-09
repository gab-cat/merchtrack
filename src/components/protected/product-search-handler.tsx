'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Category } from '@prisma/client';
import ProductSearch from './product-search';

interface ProductSearchFilters {
  query?: string;
  sort?: string;
  priceRange?: {
    min: string;
    max: string;
  };
  categories?: string[];
  inventoryType?: string[];
}

interface ProductSearchHandlerProps {
  categories: Category[];
  initialFilters?: ProductSearchFilters;
}

export default function ProductSearchHandler({ 
  categories,
  initialFilters = {}
}: Readonly<ProductSearchHandlerProps>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [hasInitialFilters, setHasInitialFilters] = useState(false);
  
  // Initialize filters from URL query parameters if present
  useEffect(() => {
    if (searchParams) {
      const urlFilters = {
        query: searchParams.get('search') ?? searchParams.get('q') ?? '',
        sort: searchParams.get('sort') ?? 'featured',
        categories: searchParams.get('categories')?.split(',').filter(Boolean) || [],
        inventoryType: searchParams.get('inventoryType')?.split(',').filter(Boolean) || [],
        priceRange: {
          min: searchParams.get('minPrice') ?? '',
          max: searchParams.get('maxPrice') ?? ''
        }
      };
      
      // We don't want to trigger a search immediately, just initialize the values
      // The ProductSearch component will handle displaying these values
      if (urlFilters.query || urlFilters.categories.length || 
          urlFilters.inventoryType.length || urlFilters.priceRange.min || 
          urlFilters.priceRange.max) {
        setHasInitialFilters(true);
      }
    }
  }, [searchParams]);
  
  const handleSearch = (filters: ProductSearchFilters) => {
    // Build the query string from filters
    const params = new URLSearchParams();
    
    if (filters.query) {
      params.set('search', filters.query);
    }
    
    if (filters.sort && filters.sort !== 'featured') {
      params.set('sort', filters.sort);
    }
    
    if (filters.priceRange?.min) {
      params.set('minPrice', filters.priceRange.min);
    }
    
    if (filters.priceRange?.max) {
      params.set('maxPrice', filters.priceRange.max);
    }
    
    if (filters.categories?.length) {
      params.set('categories', filters.categories.join(','));
    }
    
    if (filters.inventoryType?.length) {
      params.set('inventoryType', filters.inventoryType.join(','));
    }
    
    // Navigate to the products page with the query parameters
    const queryString = params.toString();
    router.push(`/products${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <ProductSearch 
      categories={categories}
      onSearch={handleSearch}
      initialFilters={{
        query: searchParams?.get('search') ?? searchParams?.get('q') ?? '',
        sort: searchParams?.get('sort') ?? 'featured',
        categories: searchParams?.get('categories')?.split(',').filter(Boolean) ?? [],
        inventoryType: searchParams?.get('inventoryType')?.split(',').filter(Boolean) ?? [],
        priceRange: {
          min: searchParams?.get('minPrice') ?? '',
          max: searchParams?.get('maxPrice') ?? ''
        },
        ...initialFilters
      }}
    />
  );
}