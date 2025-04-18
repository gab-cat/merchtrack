# MerchTrack Page Development Guidelines

This document outlines the standardized approach for developing pages in the MerchTrack application. Following these guidelines ensures consistency across the codebase and adherence to best practices.

## Table of Contents

1. [Page Component Structure](#page-component-structure)
2. [Data Fetching with QueryParams](#data-fetching-with-queryparams)
3. [Using Resource Hooks](#using-resource-hooks)
4. [Pagination Implementation](#pagination-implementation)
5. [Mutation Procedures](#mutation-procedures)
6. [Complete Examples](#complete-examples)

## Page Component Structure

### Server Components as Entry Points

Always make the `page.tsx` component a server component. This allows for better SEO, faster load times, and improved performance through server-side rendering.

```tsx
// app/products/page.tsx
export default async function ProductsPage() {
  return (
    <div>
      <h1>Products</h1>
      <ProductsClient />
    </div>
  );
}
```

### Client Components for Interactive Content

Create a separate client component to handle interactive elements and data fetching. This keeps the main page component lightweight and separates concerns.

```tsx
// app/products/components/products-client.tsx
'use client';

import { useState } from 'react';
import { useProductsQuery } from '@/hooks/products.hooks';

export function ProductsClient() {
  const [currentPage, setCurrentPage] = useState(1);
  // Implement data fetching and UI logic here...
}
```

## Data Fetching with QueryParams

### Creating Query Parameters

For effective data fetching, create an object with the type `QueryParams` to configure your queries:

```tsx
import { useMemo } from 'react';
import { QueryParams } from '@/types/common';

// Inside your client component:
const queryParams = useMemo<QueryParams>(() => ({
  where: {
    // Filter conditions
    isDeleted: false,
    // Any other filters...
  },
  include: {
    // Related entities to include
    category: true,
    // Other relations...
  },
  orderBy: {
    createdAt: 'desc',
  },
  take: 10, // Items per page
  page: currentPage, // Current page number
}), [currentPage]);
```

### Using useMemo for Query Parameters

Always use `useMemo` to create your query parameters object. This prevents unnecessary re-renders and query executions by ensuring the parameter object only changes when its dependencies change.

## Using Resource Hooks

MerchTrack provides two main types of resource hooks for data fetching:

### 1. useResourcesQuery for Collections

Use `useResourcesQuery` when fetching multiple records. This hook handles pagination and returns a structured response.

```tsx
import { useProductsQuery } from '@/hooks/products.hooks';

// Inside your component:
const { data, isLoading, error } = useProductsQuery(queryParams);

// The data object contains:
// - data.data: The array of items
// - data.metadata: Pagination metadata (total, page, lastPage, etc.)
```

### 2. useResourceQuery for Single Records

Use `useResourceQuery` when fetching a single record by its identifier:

```tsx
import { useProductQuery } from '@/hooks/products.hooks';

// Inside your component:
const { data: product, isLoading, error } = useProductQuery(productId, ['title', 'description']);
```

### Custom Resource Hooks

The app includes many pre-built resource hooks for common entities. These are built on the base `useResourceQuery` and `useResourceByIdQuery` hooks from `src/hooks/index.hooks.ts`:

- `useProductsQuery`, `useProductQuery` for products
- `useOrdersQuery`, `useOrderQuery` for orders
- `usePaymentsQuery`, `usePaymentQuery` for payments
- And many more...

## Pagination Implementation

### Handle Pagination State

Maintain pagination state in your client component:

```tsx
const [currentPage, setCurrentPage] = useState(1);
const ITEMS_PER_PAGE = 10;

// Include in query params
const queryParams = useMemo<QueryParams>(() => ({
  // ...other params
  take: ITEMS_PER_PAGE,
  page: currentPage,
}), [currentPage]);
```

### Using PaginationFooter Component

The `PaginationFooter` component from `src/app/admin/survey/components/pagination-footer.tsx` provides a standardized way to handle pagination:

```tsx
import { PaginationFooter } from '@/app/admin/survey/components/pagination-footer';

// Inside your return statement:
{data?.metadata && (
  <PaginationFooter
    currentPage={currentPage}
    totalPages={data.metadata.lastPage}
    totalItems={data.metadata.total}
    itemsPerPage={ITEMS_PER_PAGE}
    onPageChange={setCurrentPage}
  />
)}
```

The PaginationFooter displays:
- The current range of items showing
- Navigation buttons for first/previous/next/last page
- Total item count

## Mutation Procedures

### 1. Create Server Action

Define a server action function to handle the data mutation:

```tsx
// app/products/_actions.ts
'use server';

import { z } from 'zod';
import prisma from '@/lib/db';
import { verifyPermission } from '@/utils/permissions';
import { createLog } from '@/actions/logs.actions';

export async function createProduct(userId: string, data: CreateProductType): Promise<ActionsReturnType<ExtendedProduct>> {
  // Verify permissions
  if (!await verifyPermission({
    userId,
    permissions: { inventory: { canCreate: true } }
  })) {
    return {
      success: false,
      message: "You don't have permission to create products"
    };
  }

  // Process data and save to database
  try {
    const product = await prisma.product.create({
      data: {
        // Transform data as needed
      }
    });

    // Log the action
    await createLog({
      userId,
      createdById: userId,
      reason: "Product Created",
      systemText: `Created new product: ${product.title}`
    });

    return {
      success: true,
      data: product
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to create product"
    };
  }
}
```

### 2. Create Form Schema with Zod

Define validation schema using Zod:

```tsx
// schema/product.schema.ts
import { z } from 'zod';

export const createProductSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().positive("Price must be positive"),
  // Other fields...
});

export type CreateProductType = z.infer<typeof createProductSchema>;
```

### 3. Implement Form with React Hook Form and Zod

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProductSchema, CreateProductType } from '@/schema/product.schema';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

// Inside your component:
const form = useForm<CreateProductType>({
  resolver: zodResolver(createProductSchema),
  defaultValues: {
    title: '',
    description: '',
    price: 0,
    // Other default values...
  }
});
```

### 4. Use Mutation with TanStack Query

```tsx
import { useMutation } from '@tanstack/react-query';
import { createProduct } from '@/app/products/_actions';

// Inside your component:
const { mutate, isPending } = useMutation({
  mutationFn: async (data: CreateProductType) => {
    const response = await createProduct(userId, data);
    if (!response.success) {
      throw new Error(response.message || "Failed to create product");
    }
    return response.data;
  },
  onSuccess: () => {
    // Handle success
    toast({
      type: "success",
      message: "Product created successfully",
      title: "Success"
    });
    router.push('/products');
  },
  onError: (error: Error) => {
    // Handle error
    toast({
      type: "error",
      message: error.message || "Failed to create product",
      title: "Error creating product"
    });
  }
});

// Then in your form submission:
const onSubmit = (data: CreateProductType) => {
  mutate(data);
};
```

### 5. Create Form Component with Submit Handler

```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
    <FormField
      control={form.control}
      name="title"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Title</FormLabel>
          <FormControl>
            <Input placeholder="Enter product title" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    
    {/* More form fields... */}
    
    <Button type="submit" disabled={isPending}>
      {isPending ? "Creating..." : "Create Product"}
    </Button>
  </form>
</Form>
```

## Complete Examples

### Example 1: Products Page with Pagination and Filtering

```tsx
// app/products/page.tsx (Server Component)
export default async function ProductsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-primary">Products</h1>
      <ProductsClient />
    </div>
  );
}

// app/products/components/products-client.tsx (Client Component)
'use client';

import { useState, useMemo } from 'react';
import { useProductsQuery } from '@/hooks/products.hooks';
import { PaginationFooter } from '@/app/admin/survey/components/pagination-footer';
import { ProductCard } from '@/components/product/product-card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export function ProductsClient() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<string>('all');
  const ITEMS_PER_PAGE = 12;
  
  const queryParams = useMemo(() => ({
    where: {
      isDeleted: false,
      ...(searchTerm ? {
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } }
        ]
      } : {}),
      ...(category !== 'all' ? { categoryId: category } : {})
    },
    include: {
      category: true,
      variants: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: ITEMS_PER_PAGE,
    page: currentPage
  }), [searchTerm, category, currentPage]);
  
  const { data, isLoading } = useProductsQuery(queryParams);
  
  return (
    <div>
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
        <Input 
          placeholder="Search products..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:w-1/3"
        />
        <Select 
          value={category}
          onValueChange={setCategory}
          options={[
            { label: 'All Categories', value: 'all' },
            // Other options...
          ]}
          className="md:w-1/3"
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-12">
          <Spinner size="lg" className="text-primary" />
        </div>
      ) : !data?.data.length ? (
        <div className="text-center p-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No products found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <PaginationFooter
            currentPage={currentPage}
            totalPages={data.metadata.lastPage}
            totalItems={data.metadata.total}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
```

### Example 2: Create Product Form with Mutation

```tsx
// app/admin/products/new/page.tsx (Server Component)
export default async function NewProductPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 text-primary">Create New Product</h1>
      <NewProductForm />
    </div>
  );
}

// app/admin/products/new/components/new-product-form.tsx (Client Component)
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { createProduct } from '@/app/admin/products/_actions';
import { createProductSchema, CreateProductType } from '@/schema/product.schema';
import { useUserStore } from '@/stores/user.store';
import useToast from '@/hooks/use-toast';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export function NewProductForm() {
  const { userId } = useUserStore();
  const router = useRouter();
  
  const form = useForm<CreateProductType>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      // Other defaults...
    }
  });
  
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: CreateProductType) => {
      if (!userId) throw new Error("Not authenticated");
      
      const response = await createProduct(userId, data);
      if (!response.success) {
        throw new Error(response.message || "Failed to create product");
      }
      return response.data;
    },
    onSuccess: () => {
      useToast({
        type: "success",
        message: "Product created successfully",
        title: "Success"
      });
      router.push('/admin/products');
    },
    onError: (error: Error) => {
      useToast({
        type: "error",
        message: error.message || "Failed to create product",
        title: "Error creating product"
      });
    }
  });
  
  const onSubmit = (data: CreateProductType) => {
    mutate(data);
  };
  
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter product description" 
                    {...field} 
                    rows={5}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="bg-primary"
            >
              {isPending ? (
                <>
                  <span className="animate-spin mr-2">●</span>
                  Creating...
                </>
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
```

By following these guidelines, you'll ensure that your pages are consistent with the rest of the MerchTrack application, making the codebase more maintainable and easier to understand for all contributors.
