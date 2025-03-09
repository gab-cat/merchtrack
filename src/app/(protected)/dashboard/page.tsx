import { Metadata } from "next";
import { BarChart3, Truck, Award, ShieldCheck } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { Category } from "@prisma/client";
import { getCategories } from "@/actions/category.actions";
import { getProducts } from "@/actions/products.actions";
import HeroSection from "@/components/protected/hero-section";
import CategoryShowcase from "@/components/protected/category-showcase";
import FeaturedProducts from "@/components/protected/featured-products";
import ProductSearchHandler from "@/components/protected/product-search-handler";
import PromotionsBanner from "@/components/protected/promotions-banner";

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

// Example promotions data - in a real application this would come from the database
const PROMOTIONS = [
  {
    id: "promo1",
    title: "Summer Sale",
    description: "Get 20% off on all summer merchandise with code:",
    code: "SUMMER20",
    expiryDate: "2023-08-31",
    ctaText: "Shop Now",
    ctaLink: "/products?tag=summer",
    color: "blue"
  },
  {
    id: "promo2",
    title: "New Customer Offer",
    description: "Sign up and get 10% off your first purchase",
    ctaText: "Sign Up",
    ctaLink: "/register",
    color: "green"
  },
  {
    id: "promo3",
    title: "Free Shipping",
    description: "Free shipping on all orders over $50",
    expiryDate: "2023-09-15",
    ctaText: "Learn More",
    ctaLink: "/shipping-policy",
    color: "purple"
  }
];

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
      <div className="mx-auto mt-3 max-w-4xl px-4">
        <PromotionsBanner promotions={PROMOTIONS} />
      </div>
      
      {/* Hero section - Hero component already has max-width-4xl applied */}
      <div className="mx-auto mt-6 px-4">
        <HeroSection />
      </div>
      
      {/* Categories */}
      <div className="mx-auto mt-10 max-w-4xl px-4">
        <CategoryShowcase 
          categories={categories as Category[]}
          title="Shop By Category"
        />
      </div>
      
      {/* Product search */}
      <div className="mx-auto mt-12 max-w-4xl px-4">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-2xl font-bold">Search Products</h2>
          <ProductSearchHandler categories={categories as Category[]} />
        </div>
      </div>
      
      {/* Featured products */}
      <div className="mx-auto mt-12 max-w-4xl px-4">
        {(featuredProducts ?? []).length > 0 && (
          <FeaturedProducts 
            products={featuredProducts ?? []} 
            title="New Arrivals"
          />
        )}
        
        {/* Benefits section */}
        <div className="mt-16 grid grid-cols-1 gap-6 py-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center rounded-lg border bg-white p-6 text-center shadow-sm">
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <Truck className="size-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Fast Delivery</h3>
            <p className="text-muted-foreground text-sm">
              Quick shipping options available. Get your products delivered to your doorstep in no time.
            </p>
          </div>
          
          <div className="flex flex-col items-center rounded-lg border bg-white p-6 text-center shadow-sm">
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <Award className="size-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Quality Guarantee</h3>
            <p className="text-muted-foreground text-sm">
              All products go through rigorous quality checks to ensure you get the best.
            </p>
          </div>
          
          <div className="flex flex-col items-center rounded-lg border bg-white p-6 text-center shadow-sm">
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <ShieldCheck className="size-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Secure Payment</h3>
            <p className="text-muted-foreground text-sm">
              Your payment information is always protected with our secure payment system.
            </p>
          </div>
          
          <div className="flex flex-col items-center rounded-lg border bg-white p-6 text-center shadow-sm">
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <BarChart3 className="size-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Real-time Tracking</h3>
            <p className="text-muted-foreground text-sm">
              Track your order status in real-time with our advanced tracking system.
            </p>
          </div>
        </div>
        
        {(bestSellers ?? []).length > 0 && (
          <div className="mt-16">
            <FeaturedProducts 
              products={bestSellers ?? []} 
              title="Best Sellers"
            />
          </div>
        )}
        
        {(bestDeals ?? []).length > 0 && (
          <div className="mt-16">
            <FeaturedProducts 
              products={bestDeals ?? []} 
              title="Best Deals"
            />
          </div>
        )}
      </div>
    </div>
  );
}