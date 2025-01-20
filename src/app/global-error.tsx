"use client";

import * as Sentry from "@sentry/nextjs";
import { useCallback, useEffect } from 'react';
import { NODE_ENV } from "@/config";

export default function GlobalError({ error }: Readonly<{ error: Error & { digest?: string } }>) {
  useEffect(() => {
    if (NODE_ENV !== 'production') {
      // no-dd-sa:typescript-best-practices/no-console
      console.error('Global error caught:', error);
    }
    Sentry.captureException(error);
  }, [error]);

  const handleReport = useCallback(() => {
    Sentry.showReportDialog();
  }, []);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
          <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
            <h1 className="mb-4 text-2xl font-bold text-red-600">Oops! Something went wrong</h1>
            <p className="mb-6 text-gray-600">
              We apologize for the inconvenience. Our team has been notified and is working to fix the issue.
            </p>
            <div className="space-y-4">
              <button
                onClick={handleReport}
                className="w-full rounded bg-gray-500 px-4 py-2 font-semibold text-white hover:bg-gray-600"
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
