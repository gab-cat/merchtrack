'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, ArrowDownAZ, ArrowUpZA } from 'lucide-react';
import { Category } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

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

interface ProductSearchProps {
  categories: Category[];
  onSearch: (params: ProductSearchFilters) => void;
  initialFilters?: ProductSearchFilters;
}

export default function ProductSearch({ 
  categories, 
  onSearch,
  initialFilters = {} 
}: Readonly<ProductSearchProps>) {
  // Initialize state from initialFilters if available
  const [searchQuery, setSearchQuery] = useState(initialFilters.query ?? '');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSort, setSelectedSort] = useState(initialFilters.sort ?? 'featured');
  const [priceRange, setPriceRange] = useState({ 
    min: initialFilters.priceRange?.min ?? '', 
    max: initialFilters.priceRange?.max ?? '' 
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialFilters.categories ?? []);
  const [selectedInventoryType, setSelectedInventoryType] = useState<string[]>(initialFilters.inventoryType ?? []);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Effect to update active filters display based on current filter state
  useEffect(() => {
    updateActiveFiltersDisplay();
    
    // If we have initial filters, trigger a search to properly display results
    const hasInitialFilters = searchQuery || 
      selectedCategories.length > 0 || 
      selectedInventoryType.length > 0 || 
      priceRange.min || 
      priceRange.max ||
      (selectedSort !== 'featured');
      
    if (hasInitialFilters) {
      handleSearch();
    }
  }, []);

  const updateActiveFiltersDisplay = () => {
    const newActiveFilters = [];
    if (searchQuery) newActiveFilters.push(`Search: ${searchQuery}`);
    if (selectedCategories.length > 0) {
      newActiveFilters.push(`Categories: ${selectedCategories.length} selected`);
    }
    if (selectedInventoryType.length > 0) {
      newActiveFilters.push(`Inventory: ${selectedInventoryType.join(', ')}`);
    }
    if (priceRange.min && priceRange.max) {
      newActiveFilters.push(`Price: $${priceRange.min} - $${priceRange.max}`);
    } else if (priceRange.min) {
      newActiveFilters.push(`Price: >$${priceRange.min}`);
    } else if (priceRange.max) {
      newActiveFilters.push(`Price: <$${priceRange.max}`);
    }
    
    setActiveFilters(newActiveFilters);
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const filters: ProductSearchFilters = {
      query: searchQuery,
      sort: selectedSort,
      priceRange: priceRange.min || priceRange.max ? priceRange : undefined,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      inventoryType: selectedInventoryType.length > 0 ? selectedInventoryType : undefined,
    };
    
    onSearch(filters);
    updateActiveFiltersDisplay();
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  const handleInventoryTypeChange = (type: string) => {
    setSelectedInventoryType(prev => 
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedSort('featured');
    setPriceRange({ min: '', max: '' });
    setSelectedCategories([]);
    setSelectedInventoryType([]);
    setActiveFilters([]);
    onSearch({});
  };

  const removeFilter = (filterIndex: number) => {
    const filterToRemove = activeFilters[filterIndex];
    
    // Reset the corresponding filter
    if (filterToRemove.startsWith('Search:')) {
      setSearchQuery('');
    } else if (filterToRemove.startsWith('Categories:')) {
      setSelectedCategories([]);
    } else if (filterToRemove.startsWith('Inventory:')) {
      setSelectedInventoryType([]);
    } else if (filterToRemove.startsWith('Price:')) {
      setPriceRange({ min: '', max: '' });
    }
    
    // Update active filters display
    const newActiveFilters = [...activeFilters];
    newActiveFilters.splice(filterIndex, 1);
    setActiveFilters(newActiveFilters);
    
    // Re-run search with updated filters
    setTimeout(() => handleSearch(), 0);
  };


  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex items-start gap-2">
        <div className="relative w-full">
          <Input
            type="search"
            placeholder="Search products by name, description, or tags..."
            className="pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0"
          >
            <Search className="size-4" />
            <span className="sr-only">Search</span>
          </Button>
        </div>
        
        <Button
          type="button"
          variant={showFilters ? "secondary" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className="shrink-0"
        >
          <Filter className="mr-2 size-4" />
          Filters
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="shrink-0">
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Sort Products</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => {setSelectedSort('featured'); handleSearch();}}>
              Featured
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {setSelectedSort('newest'); handleSearch();}}>
              Newest Arrivals
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {setSelectedSort('price_asc'); handleSearch();}}>
              <ArrowDownAZ className="mr-2 size-4" /> Price: Low to High
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {setSelectedSort('price_desc'); handleSearch();}}>
              <ArrowUpZA className="mr-2 size-4" /> Price: High to Low
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {setSelectedSort('rating'); handleSearch();}}>
              Highest Rated
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {setSelectedSort('bestseller'); handleSearch();}}>
              Best Sellers
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </form>
      
      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-sm">Active Filters:</span>
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {filter}
              <button
                onClick={() => removeFilter(index)}
                className="hover:bg-muted ml-1 rounded-full p-0.5"
                aria-label={`Remove filter ${filter}`}
              >
                ✕
              </button>
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-7 text-xs"
          >
            Clear All
          </Button>
        </div>
      )}
      
      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-card rounded-md border p-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="categories">
              <AccordionTrigger>Categories</AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => handleCategoryChange(category.id)}
                      />
                      <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="price">
              <AccordionTrigger>Price Range</AccordionTrigger>
              <AccordionContent>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">$</span>
                    <Input
                      type="number"
                      placeholder="Min"
                      className="w-24"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    />
                  </div>
                  <span>to</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">$</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      className="w-24"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="inventory">
              <AccordionTrigger>Inventory Type</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inventory-stock"
                      checked={selectedInventoryType.includes('STOCK')}
                      onCheckedChange={() => handleInventoryTypeChange('STOCK')}
                    />
                    <Label htmlFor="inventory-stock">In Stock</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inventory-preorder"
                      checked={selectedInventoryType.includes('PREORDER')}
                      onCheckedChange={() => handleInventoryTypeChange('PREORDER')}
                    />
                    <Label htmlFor="inventory-preorder">Pre-order</Label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={clearAllFilters}>
              Reset
            </Button>
            <Button onClick={() => handleSearch()}>
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}