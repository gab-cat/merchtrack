/* eslint-disable @next/next/no-before-interactive-script-outside-document */
'use client';

import Script from "next/script";
import { memo, useEffect } from "react";
import { CF_BEACON_TOKEN } from "@/config";

// Add TypeScript declaration for the Chatwoot SDK
declare global {
  interface Window {
    chatwootSettings: {
      position: string;
      type: string;
      launcherTitle: string;
    };
    chatwootSDK: {
      run: (config: { websiteToken: string; baseUrl: string }) => void;
    };
    $chatwoot: {
      setUser: (
        identifier: string,
        userAttributes: {
          name?: string;
          avatar_url?: string;
          email?: string;
          identifier_hash?: string;
          phone_number?: string;
          description?: string;
          country_code?: string;
          city?: string;
          company_name?: string;
          social_profiles?: {
            twitter?: string;
            linkedin?: string;
            facebook?: string;
            github?: string;
          };
        }
      ) => void;
      reset: () => void;
    };
  }
}

const Scripts = memo(() => {
  // Effect to ensure Chatwoot is properly initialized and available globally
  // useEffect(() => {
  //   const chatWootInterval = setInterval(() => {
  //     if (typeof window !== "undefined" && window.$chatwoot) {
  //       clearInterval(chatWootInterval);
  //       console.log("Chatwoot initialized successfully");
  //     }
  //   }, 1000);

  //   // Clean up interval on component unmount
  //   return () => clearInterval(chatWootInterval);
  // }, []);

  return (
    <>
      <Script 
        defer
        src='https://static.cloudflareinsights.com/beacon.min.js' 
        data-cf-beacon={`{"token": "${CF_BEACON_TOKEN}"}`} 
      />

      <Script
        id="chatwoot-settings"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.chatwootSettings = {
                "position": "right",
                "type": "expanded_bubble",
                "launcherTitle": "Chat with us",
                "baseDomain": "${process.env.NEXT_PUBLIC_URL}",
            };
        `,
        }}
      />
      <Script
        id="chatwoot-sdk"
        src={`${process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL}/packs/js/sdk.js`}
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== "undefined" && window.chatwootSDK) {
            window.chatwootSDK.run({
              websiteToken: process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN!,
              baseUrl: process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL!,
            });
          }
        }}
      />
    </>
  );
});

Scripts.displayName = 'Scripts';
export default Scripts;