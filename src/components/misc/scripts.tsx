import { CF_BEACON_TOKEN } from "@/config";
import Script from "next/script";

const Scripts = () => {
  return (
    <Script 
      strategy="afterInteractive" 
      defer 
      src='https://static.cloudflareinsights.com/beacon.min.js' 
      data-cf-beacon={`{"token": "${CF_BEACON_TOKEN}"}`} 
    />
  );
};

export default Scripts;