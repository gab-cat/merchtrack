"use client";

import * as Sentry from "@sentry/nextjs";
import { useCallback, useEffect } from 'react';

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

  const handleReport = useCallback(() => {
    Sentry.showReportDialog();
  }, []);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    // skipcq: JS-0415
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              We apologize for the inconvenience. Our team has been notified and is working to fix the issue.
            </p>
            <div className="space-y-4">
              <button
                onClick={handleRetry}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
              >
                Try Again
              </button>
              <button
                onClick={handleReport}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded"
              >
                Report This Issue
              </button>
              <a
                href="mailto:support@merchtrack.tech"
                className="block text-center text-blue-500 hover:text-blue-600"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
