"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({ error }: Readonly<{ error: Error & { digest?: string } }>) {
  useEffect(() => {
    // Log error details locally for development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Global error caught:', error);
    }
    
    // Add additional context to the error
    Sentry.configureScope((scope) => {
      scope.setExtra('errorInfo', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    });
    // skipcq: JS-E1007
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        {/* `NextError` is the default Next.js error page component. Its type
        definition requires a `statusCode` prop. However, since the App Router
        does not expose status codes for errors, we simply pass 0 to render a
        generic error message. */}
        <NextError statusCode={0} />
      </body>
    </html>
  );
}
