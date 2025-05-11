"use client";

import { datadogRum } from '@datadog/browser-rum';
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { 
  NEXT_PUBLIC_DATADOG_APPLICATION_ID,
  NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
  NEXT_PUBLIC_DATADOG_SITE,
  NEXT_PUBLIC_DATADOG_SERVICE_NAME,
  NODE_ENV
} from '@/config';

let isDatadogInitialized = false;

function initializeDatadog() {
  if (shouldInitializeDatadog()) {
    try {
      datadogRum.init({
        applicationId: NEXT_PUBLIC_DATADOG_APPLICATION_ID!,
        clientToken: NEXT_PUBLIC_DATADOG_CLIENT_TOKEN!,
        site: NEXT_PUBLIC_DATADOG_SITE,
        service: NEXT_PUBLIC_DATADOG_SERVICE_NAME,
        env: NODE_ENV,
        version: '1.0.0',
        sessionSampleRate: 100,
        sessionReplaySampleRate: 20,
        trackUserInteractions: true,
        trackResources: true,
        trackLongTasks: true,
        defaultPrivacyLevel: 'mask-user-input',
      });
      isDatadogInitialized = true;
      datadogRum.startSessionReplayRecording();
    } catch (error) {
      Sentry.captureException(new Error('Failed to initialize Datadog RUM'), {
        extra: {
          error,
          env: NODE_ENV,
          hasAppId: Boolean(NEXT_PUBLIC_DATADOG_APPLICATION_ID),
          hasClientToken: Boolean(NEXT_PUBLIC_DATADOG_CLIENT_TOKEN),
        },
      });
    }
  } else if (!NEXT_PUBLIC_DATADOG_APPLICATION_ID || !NEXT_PUBLIC_DATADOG_CLIENT_TOKEN) {
    Sentry.captureMessage('Datadog configuration is missing required values', {
      level: 'warning',
      extra: {
        missingAppId: !NEXT_PUBLIC_DATADOG_APPLICATION_ID,
        missingClientToken: !NEXT_PUBLIC_DATADOG_CLIENT_TOKEN,
      },
    });
  }
}

/**
 * Determines if Datadog RUM should be initialized.
 * @returns {boolean} True if Datadog hasn't been initialized and required configuration is present
 */
function shouldInitializeDatadog(): boolean {
  return (!isDatadogInitialized && NEXT_PUBLIC_DATADOG_APPLICATION_ID && NEXT_PUBLIC_DATADOG_CLIENT_TOKEN) as boolean;
}

export default function DatadogInit() {
  useEffect(() => {
    // Only initialize in production
    if (NODE_ENV !== 'production') return;

    initializeDatadog();
  }, []);

  return null;
}
