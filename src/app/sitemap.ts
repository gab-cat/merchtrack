import type { MetadataRoute } from 'next';
import prisma from '@/lib/db';

type SitemapItem = {
    url: string;
    lastModified?: Date | string;
    changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
    images?: string[];
};
 
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
  const staticRoutes: SitemapItem[] = [
    '',
    '/about',
    '/contact',
    '/faqs',
    '/terms-of-service',
    '/privacy-policy',
    '/sign-in',
    '/sign-up',
  ].map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'monthly',
    priority: route === '' ? 1 : 0.8
  }));
      
  // Dynamic product routes
  const productRoutes: SitemapItem[] = products.map(product => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt.toISOString(),
    changeFrequency: 'weekly',
    priority: 0.6,
    images: product.imageUrl
  }));
      
  // Dynamic category routes
  const categoryRoutes: SitemapItem[] = categories.map(category => ({
    url: `${baseUrl}/categories/${category.name}`,
    lastModified: category.updatedAt.toISOString(),
    changeFrequency: 'weekly',
    priority: 0.7
  }));
    
  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}