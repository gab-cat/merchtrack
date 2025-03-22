import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug, getProducts } from '@/actions/products.actions';
import ProductListing from "@/components/product/product-listing";

type Props = {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60; 
export const dynamicParams = true; 

export async function generateStaticParams() {
  // Fetch all products to generate static paths
  const productsResponse = await getProducts('');
  const products = productsResponse.data?.data || [];

  return products.map(product => ({
    slug: product.slug,
  }));
}

// Generate dynamic metadata for SEO
export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  // Get product data
  const { slug } = await params;
  const productResult = await getProductBySlug({ userId: '', slug });
  
  // If product not found, return basic metadata
  if (!productResult.success || !productResult.data) {
    return {
      title: 'Product Not Found | MerchTrack',
      description: 'The product you are looking for could not be found.',
    };
  }
  
  const product = productResult.data;
  
  // Format category text for SEO
  const categoryText = product.category ? `${product.category.name} - ` : '';
  
  return {
    title: `${product.title} | ${categoryText} MerchTrack`,
    description: product.description ?? `Buy ${product.title} at MerchTrack - Your one-stop solution for premium merchandise.`,
    keywords: [
      ...product.tags || [],
      'merchandise',
      'online shopping',
      product.category?.name || 'products',
    ].join(', '),
    openGraph: {
      title: product.title,
      description: product.description ?? `Buy ${product.title} at MerchTrack`,
      images: product.imageUrl && product.imageUrl.length > 0 ? [product.imageUrl[0]] : ['/img/logo.png'],
      url: `/products/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.description ?? `Buy ${product.title} at MerchTrack`,
      images: product.imageUrl && product.imageUrl.length > 0 ? [product.imageUrl[0]] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Readonly<Props>) {
  const { slug } = await params;
  const productResult = await getProductBySlug({ userId: '', slug });
  

  if (!productResult.success || !productResult.data) {
    return notFound();
  }

  const product = productResult.data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <ProductListing slug={slug} product={product} />
    </div>
  );
}