'use client';

import { ErrorBoundary } from '@/components/error-boundary';
import { useErrorHandler } from '@/hooks/use-error-handler';

const Page = () => {
  const handleError = useErrorHandler();

  return (
    <ErrorBoundary>
    <button
      type="button"
      onClick={() => handleError(() => {
        throw new Error("Sentry Frontend Error");
      })}
      data-sentry-component="Page"
      data-sentry-source-file="page.tsx"
    >
      Throw error
    </button>
    </ErrorBoundary>
  );
};

export default Page;