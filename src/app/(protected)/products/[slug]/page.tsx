import ProductListing from "@/components/product/product-listing";
import SmoothScrollLayout from "@/components/public/smooth-scroll-layout";

type Props = {
    params: Promise<{ slug: string }>
}

export default async function Home({ params }: Props) {
  const { slug } = await params;

  return (
    <SmoothScrollLayout>
      <ProductListing slug={slug}/>
    </SmoothScrollLayout>
  );
}