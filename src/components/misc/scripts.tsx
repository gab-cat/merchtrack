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
      <Script id="chatwoot-sdk" strategy="afterInteractive">
        {`window.chatwootSettings = {"position":"right","type":"expanded_bubble","launcherTitle":"Chat with us"};
          (function(d,t) {
          var BASE_URL=${process.env.NEXT_PUBLIC_CHATWOOT_BASE_URL};
          var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
          g.src=BASE_URL+"/packs/js/sdk.js";
          g.defer = true;
          g.async = true;
          s.parentNode.insertBefore(g,s);
          g.onload=function(){
            window.chatwootSDK.run({
              websiteToken: ${process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN},
              baseUrl: BASE_URL
            })
          }
        })(document,"script");`}
      </Script>
    </>
  );
});

Scripts.displayName = 'Scripts';
export default Scripts;