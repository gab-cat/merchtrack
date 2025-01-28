import HeaderLP from "@/components/public/header";
import Footer from "@/components/public/footer";
import CallToAction from "@/components/public/landing/call-to-action";
import FeaturedProducts from "@/components/public/landing/featured-products";
import HeroSection from "@/components/public/landing/hero-section";
import CategoriesSection from "@/components/public/landing/categories-section";
import TestimonialSection from "@/components/public/landing/testimonial-section";
import UniversityMerchSection from "@/components/public/landing/university-merch-section";


export default async function Home() {
  return (
    <main className="font-inter">
      <HeaderLP />
      <HeroSection />
      <CategoriesSection />
      <FeaturedProducts />
      <UniversityMerchSection />
      <TestimonialSection />
      <CallToAction />
      <Footer /> 
    </main>
  );
}
