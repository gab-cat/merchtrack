import HeaderLP from "@/components/public/header";
import Footer from "@/components/public/footer";
import CallToAction from "@/components/public/landing/call-to-action";
import FeaturedProducts from "@/components/public/landing/featured-products";
import HeroSection from "@/components/public/landing/hero-section";
import CategoriesSection from "@/components/public/landing/categories-section";
import TestimonialSection from "@/components/public/landing/testimonial-section";
import UniversityMerchSection from "@/components/public/landing/university-merch-section";
import SmoothScrollLayout from "@/components/public/smooth-scroll-layout";

export default function Home() {
  return (
    <SmoothScrollLayout>
      <main className="relative w-full font-inter">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <HeaderLP />
          <HeroSection />
          <CategoriesSection />
          <FeaturedProducts />
          <UniversityMerchSection />
          <TestimonialSection />
          <CallToAction />
        </div>
      </main>
      <Footer />
    </SmoothScrollLayout>
  );
}
