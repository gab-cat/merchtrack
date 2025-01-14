'use client';

import { CF_BEACON_TOKEN } from "@/config";
import Script from "next/script";
import { memo } from "react";
import * as Sentry from "@sentry/nextjs";

const Scripts = memo(() => {
  return (
    <Script 
      strategy="afterInteractive" 
      defer 
      src='https://static.cloudflareinsights.com/beacon.min.js' 
      data-cf-beacon={`{"token": "${CF_BEACON_TOKEN}"}`} 
      onError={(error) => {
        Sentry.captureException(error);
      }}
    />
  );
});

Scripts.displayName = 'Scripts';
export default Scripts;