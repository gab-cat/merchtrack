import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";
import { getCategories } from "@/actions/category.actions";
import { getProducts } from "@/actions/products.actions";
import ProductSearchHandler from "@/components/protected/product-search-handler";
import ProductCard from "@/components/protected/product-card";
import { ExtendedProduct } from "@/types/extended";
import { QueryParams } from "@/types/common";

export const metadata: Metadata = {
  title: "Products | MerchTrack",
  description: "Browse our collection of premium merchandise available for purchase.",
  keywords: "products, merchandise, shopping, ecommerce",
};

interface SearchParams {
  search?: string;
  q?: string; // Alternative search param
  sort?: string;
  categories?: string;
  inventoryType?: string;
  minPrice?: string;
  maxPrice?: string;
}

export default async function ProductsPage({
  searchParams
}: Readonly<{
  searchParams: SearchParams
}>) {
  const { userId } = await auth();
  
  if (!userId) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <p>Please sign in to view products.</p>
      </div>
    );
  }
  
  // Fetch categories for filtering
  const categoriesResult = await getCategories();
  const categories = categoriesResult.success ? categoriesResult.data : [];
  
  // Build query for products based on search params
  const query: QueryParams = {
    where: { isDeleted: false },
    take: 24
  };
  
  // Apply search term filter
  const searchTerm = searchParams.search ?? searchParams.q;
  if (searchTerm) {
    query.where = {
      ...query.where,
      OR: [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { tags: { has: searchTerm } }
      ]
    };
  }
  
  // Apply category filter
  if (searchParams.categories) {
    const categoryIds = searchParams.categories.split(',');
    if (categoryIds.length > 0) {
      query.where = {
        ...query.where,
        categoryId: { in: categoryIds }
      };
    }
  }
  
  // Apply inventory type filter
  if (searchParams.inventoryType) {
    const types = searchParams.inventoryType.split(',');
    if (types.length > 0) {
      query.where = {
        ...query.where,
        inventoryType: { in: types }
      };
    }
  }
  
  // Apply price range filter
  if (searchParams.minPrice || searchParams.maxPrice) {
    const priceConditions = [];
    
    if (searchParams.minPrice) {
      priceConditions.push({ price: { gte: parseFloat(searchParams.minPrice) } });
    }
    
    if (searchParams.maxPrice) {
      priceConditions.push({ price: { lte: parseFloat(searchParams.maxPrice) } });
    }

    // Price filters need to apply to product variants since that's where prices are stored
    query.where = {
      ...query.where,
      variants: {
        some: {
          AND: priceConditions
        }
      }
    };
  }
  
  // Apply sorting
  if (searchParams.sort) {
    switch (searchParams.sort) {
    case 'newest':
      query.orderBy = { createdAt: 'desc' };
      break;
    case 'price_asc':
      // We'll need to sort in-memory since price is in variants
      query.orderBy = { title: 'asc' }; // Default sort
      break;
    case 'price_desc':
      // We'll need to sort in-memory since price is in variants
      query.orderBy = { title: 'asc' }; // Default sort
      break;
    case 'rating':
      query.orderBy = { rating: 'desc' };
      break;
    case 'bestseller':
      // Assuming you track sales or popularity somehow
      query.where = {
        ...query.where,
        isBestPrice: true
      };
      query.orderBy = { rating: 'desc' };
      break;
    default:
      // Featured or default sorting
      query.orderBy = { updatedAt: 'desc' };
    }
  } else {
    // Default sort
    query.orderBy = { updatedAt: 'desc' };
  }
  
  // Fetch products based on query
  const productsResult = await getProducts(userId, query);
  let products = productsResult.success ? productsResult.data?.data : [];
  

  if (!products?.length) {
    console.warn('No products found based on the provided query.');

    return <div>No products found.</div>;
  }
  
  // Special handling for price sorting (since price is in variants)
  if (searchParams.sort === 'price_asc' || searchParams.sort === 'price_desc') {
    products = [...products].sort((a, b) => {
      const aPrice = a.variants.length > 0 ? 
        Math.min(...a.variants.map(v => Number(v.price))) : Number.MAX_VALUE;
      const bPrice = b.variants.length > 0 ? 
        Math.min(...b.variants.map(v => Number(v.price))) : Number.MAX_VALUE;
      
      return searchParams.sort === 'price_asc' ? aPrice - bPrice : bPrice - aPrice;
    });
  }
  
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-6 text-3xl font-bold">Products</h1>
      
      <div className="mb-8">
        <ProductSearchHandler categories={categories ?? []} />
      </div>
      
      {/* Products Grid */}
      <Suspense fallback={<div>Loading products...</div>}>
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product: ExtendedProduct) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <h2 className="mb-2 text-xl font-semibold">No products found</h2>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </Suspense>
      
      {/* Pagination - Could be added later if needed */}
    </div>
  );
}