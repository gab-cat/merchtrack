import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import dynamic from 'next/dynamic';
import tailwindConfig from '../../tailwind.config';
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
  const colors = tailwindConfig.theme.extend.colors;
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
      <ClerkProvider 
        signUpUrl='/sign-up'
        signUpFallbackRedirectUrl='/'
        signUpForceRedirectUrl='/faqs'
        appearance={{
          layout: {
            logoImageUrl: '/img/merch-track-logo.png',
            logoLinkUrl: '/',
            termsPageUrl: '/terms-and-service',
            privacyPageUrl: '/privacy-policy'
          },
          variables: {
            colorPrimary: colors.primary,
            colorBackground: colors.neutral[1],
            borderRadius: '5px',
          },
          elements: {
            formButtonPrimary: "bg-primary-500 text-white border-0 shadow-0 relative transition-all text-sm",
            formButtonSecondary: "bg-white relative border-0 text-sm",
            footerActionText: " text-md",
            footerActionLink: "text-primary hover:text-primary hover:brightness-95 font-semibold text-md",
            buttonPrimary: "bg-primary-500 border-0 shadow-0 relative hover:bg-primary-400 transition-all text-sm",
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
