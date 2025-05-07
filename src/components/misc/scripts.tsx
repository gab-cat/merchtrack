'use client';

import Script from "next/script";
import { memo } from "react";
import { CF_BEACON_TOKEN } from "@/config";

const Scripts = memo(() => {
  return (
    <>
      <Script 
        defer
        src='https://static.cloudflareinsights.com/beacon.min.js' 
        data-cf-beacon={`{"token": "${CF_BEACON_TOKEN}"}`} 
      />
      <Script
        id="chatwoot-settings"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
            window.chatwootSettings = {
                "position": "right",
                "type": "expanded_bubble",
                "launcherTitle": "Chat with us"
            };
        `,
        }}
      />
      <Script
        src={`${process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL}/packs/js/sdk.js`}
        strategy="afterInteractive"
        onLoad={() => {
          // @ts-expect-error - ignore
          if (typeof window !== "undefined" && window.chatwootSDK) {
            // @ts-expect-error - ignore
            window.chatwootSDK.run({
              websiteToken: process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN,
              baseUrl: process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL,
            });
          }
        }}
      />
    </>
  );
});

Scripts.displayName = 'Scripts';
export default Scripts;