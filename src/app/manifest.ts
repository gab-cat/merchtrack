import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MerchTrack - Ultimate Merchandise Management",
    short_name: "MerchTrack",
    start_url: "/",
    icons: [
      {
        src: "/img/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/img/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      }
    ],
    screenshots: [
      {
        src: "/img/screenshot-desktop.png",
        sizes: "1280x800",
        type: "image/png",
        form_factor: "wide"
      },
      {
        src: "/img/screenshot-mobile.png",
        sizes: "750x1334",
        type: "image/png"
      }
    ],
    theme_color: "#2C59DB",
    background_color: "#ffffff",
    display: "standalone"
  };
} 