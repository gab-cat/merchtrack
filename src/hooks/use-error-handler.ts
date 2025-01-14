'use client';

mport { useCallback } from 'react';
mport * as Sentry from '@sentry/nextjs';
mport { NODE_ENV } from '@/config';

xport function useErrorHandler() {
 return useCallback((fn: () => void) => {
   try {
     fn();
   } catch (error) {
     if (NODE_ENV !== 'production') {
       console.error('Error caught by handler:', error);
     }

     if (error instanceof Error) {
       Sentry.captureException(error);
       throw error; // Re-throw to be caught by error boundary
     }
   }
 }, []);