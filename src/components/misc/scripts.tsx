import Script from "next/script";
import { memo } from "react";
import { CF_BEACON_TOKEN } from "@/config";

const Scripts = memo(() => {
  return (
    <Script 
      defer
      src='https://static.cloudflareinsights.com/beacon.min.js' 
      data-cf-beacon={`{"token": "${CF_BEACON_TOKEN}"}`} 
    />
  );
});

Scripts.displayName = 'Scripts';
export default Scripts;