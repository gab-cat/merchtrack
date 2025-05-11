import type { MetadataRoute } from 'next';
import { NEXT_PUBLIC_APP_URL } from '@/config';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = NEXT_PUBLIC_APP_URL || 'https://merchtrack.tech';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/dashboard/', '/api/', '/auth/', '/_next/', '/static/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}