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
          var BASE_URL="https://chat.merchtrack.tech";
          var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
          g.src=BASE_URL+"/packs/js/sdk.js";
          g.defer = true;
          g.async = true;
          s.parentNode.insertBefore(g,s);
          g.onload=function(){
            window.chatwootSDK.run({
              websiteToken: 'Vieh6PsUTGGFKdYR6NS3sTnG',
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