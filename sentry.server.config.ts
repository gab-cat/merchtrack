// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { SENTRY_DSN, NODE_ENV, SENTRY_TRACES_SAMPLE_RATE } from "@/config";
import * as Sentry from "@sentry/nextjs";

if (NODE_ENV === 'production') {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: Number.parseFloat(SENTRY_TRACES_SAMPLE_RATE) ?? 0.1,
    debug: false,
  });
}
