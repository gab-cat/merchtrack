import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { SEO } from '@/constants';
import dynamic from 'next/dynamic';
import Scripts from '@/components/misc/scripts';

const DatadogInit = dynamic(() => import('@/components/misc/datadog-init'));

const interSans = Inter({
  variable: '--font-inter-sans',
  subsets: ['latin'],
  weight: ['200','300','400','500','600','700', '800'], 
});

const poppinsSans = Poppins({
  subsets: ['latin'], 
  weight: ['200','300','400','500','600','700', '800'], 
});


export const metadata: Metadata = {
  title: SEO.title,
  description: SEO.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>
          {`
          html {
            font-family: ${poppinsSans.style.fontFamily}, sans-serif;
          }
        `}
        </style>
      </head>
      <ClerkProvider>
        <body
          className={`${interSans.variable} antialiased`}
        >
          {children}
          <DatadogInit />
          <Scripts />
        </body>
      </ClerkProvider>
    </html>
  );
}
