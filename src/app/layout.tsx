import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import dynamic from 'next/dynamic';
import { SEO } from '@/constants';
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
      <ClerkProvider appearance={{
        elements: {
          formButtonPrimary:
                  "bg-inprogress hover:bg-inprogress hover:brightness-95 text-sm normal-case",

          formButtonSecondary: "bg-inprogress text-sm normal-case",
          footerActionText: " text-md",
          footerActionLink:
                  "text-inprogress hover:text-inprogress hover:brightness-95 font-semibold text-md",
        },
      }}>
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
