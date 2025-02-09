import type { MetadataRoute } from 'next';
import prisma from '@/lib/db';

type SitemapItem = {
    url: string;
    lastModified?: Date | string;
    changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
    images?: string[];
};

const STATIC_ROUTES = [
  { path: '', priority: 1 },
  { path: '/about', priority: 0.8 },
  { path: '/contact', priority: 0.8 },
  { path: '/faqs', priority: 0.8 },
  { path: '/terms-of-service', priority: 0.8 },
  { path: '/privacy-policy', priority: 0.8 },
  { path: '/sign-in', priority: 0.8 },
  { path: '/sign-up', priority: 0.8 },
];
 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://merchtrack.tech';
      
  // Get all published products
  const products = await prisma.product.findMany({
    where: { 
      isDeleted: false 
    },
    select: { 
      slug: true,
      imageUrl: true,
      updatedAt: true 
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });
      
  // Get all active categories
  const categories = await prisma.category.findMany({
    where: { 
      isDeleted: false 
    },
    select: { 
      id: true,
      name: true,
      updatedAt: true 
    }
  });
      
  // Static routes
  const staticRoutes: SitemapItem[] = STATIC_ROUTES.map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: route.path === '/' ? 1 : 0.8
  }));
      
  // Dynamic product routes
  const productRoutes: SitemapItem[] = products.map(product => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt.toISOString(),
    changeFrequency: 'daily',
    priority: 0.6,
    images: product.imageUrl
  }));
      
  // Dynamic category routes
  const categoryRoutes: SitemapItem[] = categories.map(category => ({
    url: `${baseUrl}/categories/${encodeURIComponent(category.name)}`,
    lastModified: category.updatedAt.toISOString(),
    changeFrequency: 'daily',
    priority: 0.7
  }));
    
  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}