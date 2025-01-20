export const SEO = {
  title: "MerchTrack - Streamline Your E-commerce Operations",
  description: "MerchTrack simplifies e-commerce operations with automated order management, secure payment processing, real-time analytics, and efficient fulfillment tracking. Perfect for small to medium-sized online retailers.",
  keywords: "e-commerce platform, online store management, retail automation, inventory tracking system, order fulfillment software, e-commerce analytics, SMB e-commerce solution",
  author: "T Minus One",
  robots: "index, follow",
  url: "https://merchtrack.tech",
  site_name: "MerchTrack",
  viewport: "width=device-width, initial-scale=1.0",
  charset: "UTF-8",
};

export const SEO_OG = {
  og: {
    title: "MerchTrack - Streamline Your E-commerce Operations",
    type: "website",
    image: "/img/og-image.png",
    url: SEO.url,
    site_name: SEO.site_name,
    description: SEO.description
  },
  twitter: {
    card: "summary_large_image",
    creator: "@merchtrack",
    site: "@merchtrack",
    title: SEO.title,
    description: SEO.description
  }
};
