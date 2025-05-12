import { Metadata } from "next";
import { Search } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { Category } from "@prisma/client";
import { Suspense } from "react";
import { DashboardHeroSection, DashboardCategory, DashboardBenefits, DashboardProductSection} from "@/features/customer/dashboard/components";
import { getCategories } from "@/actions/category.actions";
import { getProducts } from "@/actions/products.actions";
import ProductSearchHandler from "@/components/protected/product-search-handler";
import PromotionsBanner from "@/components/protected/promotions-banner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard | MerchTrack",
  description: "Discover premium merchandise and track your orders seamlessly with MerchTrack.",
  keywords: "merchandise tracking, product management, inventory, ecommerce dashboard",
  openGraph: {
    title: "MerchTrack Dashboard",
    description: "Your one-stop solution for merchandise tracking and management.",
    images: ["/img/logo.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MerchTrack Dashboard",
    description: "Discover premium merchandise and track your orders seamlessly with MerchTrack.",
    images: ["/img/logo.png"],
  },
};

// Welcome messages for customers
const PROMOTIONS = [
  {
    id: "welcome1",
    title: "Welcome to MerchTrack",
    description: "Discover our collection of premium merchandise and exclusive items.",
    ctaText: "Browse Products",
    ctaLink: "/products",
    color: "blue"
  },
  {
    id: "welcome2",
    title: "Easy Shopping Experience",
    description: "Track your orders in real-time and enjoy a seamless shopping experience.",
    ctaText: "Learn More",
    ctaLink: "/how-it-works",
    color: "green"
  },
  {
    id: "welcome3",
    title: "Need Help?",
    description: "Our support team is here to assist you. Feel free to reach out!",
    ctaText: "Contact Support",
    ctaLink: "/my-account/tickets",
    color: "purple"
  }
];

function StatisticSkeleton() {
  return (
    <Card className="flex flex-col items-center rounded-lg border bg-white p-6 text-center shadow-sm">
      <div className="mb-4 rounded-full bg-primary/10 p-3">
        <Skeleton className="size-6" />
      </div>
      <Skeleton className="mb-2 h-6 w-32" />
      <Skeleton className="h-4 w-48" />
    </Card>
  );
}

function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <CardContent className="p-4">
        <Skeleton className="mb-2 h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="mt-4 flex justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <p>Please sign in to view your dashboard.</p>
      </div>
    );
  }
  
  // Fetch categories
  const categoriesResult = await getCategories();
  const categories = categoriesResult.success ? categoriesResult.data : [];
  
  // Fetch all products concurrently with Promise.all
  const [featuredProductsResult, bestSellersResult, bestDealsResult] = await Promise.all([
    getProducts(userId, {
      take: 8,
      orderBy: { createdAt: 'desc' },
      where: { isDeleted: false }
    }),
    getProducts(userId, {
      take: 8,
      orderBy: { rating: 'desc' },
      where: { isDeleted: false }
    }),
    getProducts(userId, {
      take: 8,
      where: { 
        isDeleted: false,
        isBestPrice: true 
      }
    })
  ]);
  
  const featuredProducts = featuredProductsResult.success ? featuredProductsResult.data?.data : [];
  const bestSellers = bestSellersResult.success ? bestSellersResult.data?.data : [];
  const bestDeals = bestDealsResult.success ? bestDealsResult.data?.data : [];

  return (
    <div className="pb-12">
      {/* Promotions Banner */}
      <div className="mx-auto mt-3 max-w-6xl px-4">
        <Suspense fallback={<Skeleton className="h-32 w-full rounded-lg" />}>
          <PromotionsBanner promotions={PROMOTIONS} />
        </Suspense>
      </div>
      
      {/* Hero section */}
      <div className="mx-auto mt-6 px-4">
        <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-lg" />}>
          <DashboardHeroSection />
        </Suspense>
      </div>
      
      {/* Categories */}
      <div className="mx-auto mt-10 max-w-6xl px-4">
        <Suspense fallback={
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        }>
          <DashboardCategory 
            categories={categories as (Category & { products: { imageUrl: string[]; title: string; description: string; }[] })[]}
            title="Shop By Category"
          />
        </Suspense>
      </div>
      
      {/* Featured products */}
      <div className="mx-auto mt-12 max-w-6xl px-4">
        {(featuredProducts ?? []).length > 0 && (
          <Suspense fallback={
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          }>
            <DashboardProductSection 
              products={featuredProducts ?? []} 
              title="New Arrivals"
            />
          </Suspense>
        )}

              
        {/* Product search */}
        <div className="mx-auto mt-12 max-w-6xl px-4">
          <Card className="overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="size-5 text-primary" />
              Quick Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ProductSearchHandler categories={categories as Category[]} disableUrlUpdate={true} />
            </CardContent>
          </Card>
        </div>
        
        {/* Benefits section */}
        <div className="mt-16">
          <Suspense fallback={
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <StatisticSkeleton key={i} />
              ))}
            </div>
          }>
            <DashboardBenefits />
          </Suspense>
        </div>
        
        {(bestSellers ?? []).length > 0 && (
          <Suspense fallback={
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          }>
            <DashboardProductSection 
              products={bestSellers ?? []} 
              title="Best Sellers"
              viewAllLink="/products?sort=rating"
            />
          </Suspense>
        )}
        
        {(bestDeals ?? []).length > 0 && (
          <Suspense fallback={
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          }>
            <DashboardProductSection 
              products={bestDeals ?? []} 
              title="Best Deals"
              viewAllLink="/products?bestDeals=true"
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}