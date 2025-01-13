// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { SENTRY_DSN, NODE_ENV } from "@/config";
import * as Sentry from "@sentry/nextjs";

if (NODE_ENV === 'production') {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.1,
    debug: false,
  });
}
