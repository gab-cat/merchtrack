import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import DatadogInit from '@/components/misc/datadog-init';
import { SEO } from '@/constants';

const poppinsSans = Poppins({
  variable: '--font-poppins-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});


export const metadata: Metadata = {
  title: SEO.TITLE,
  description: SEO.DESCRIPTION,
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
        <body className={`${poppinsSans.variable} antialiased`}>
          {children}
          <DatadogInit />
        </body>
      </ClerkProvider>
    </html>
  );
}
