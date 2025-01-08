// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: "https://bbb846cec8219d88a9e3965e48e987ba@o4508607314329600.ingest.us.sentry.io/4508607322324992",
    tracesSampleRate: 1,
    debug: false,
  });
}
