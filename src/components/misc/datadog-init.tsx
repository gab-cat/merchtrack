'use client';

import { datadogRum } from '@datadog/browser-rum';
import packageJson from '../../../package.json';
import { NODE_ENV } from '@/config';
import * as Sentry from '@sentry/nextjs';

let isDatadogInitialized = false;

// Datadog
const DATADOG_APPLICATION_ID: string = process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID ?? '';
const DATADOG_CLIENT_TOKEN: string = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN ?? '';
const DATADOG_SITE: string = process.env.NEXT_PUBLIC_DATADOG_SITE ?? '';
const DATADOG_SERVICE: string = process.env.NEXT_PUBLIC_DATADOG_SERVICE_NAME ?? '';

function initializeDatadog() {
  if (shouldInitializeDatadog()) {
    try {
      datadogRum.init({
        applicationId: DATADOG_APPLICATION_ID,
        clientToken: DATADOG_CLIENT_TOKEN,
        site: DATADOG_SITE,
        service: DATADOG_SERVICE,
        env: NODE_ENV,
        version: packageJson.version,
        sessionSampleRate: 20,
        sessionReplaySampleRate: 20,
        trackUserInteractions: true,
        trackResources: true,
        trackLongTasks: true,
        defaultPrivacyLevel: 'mask-user-input',
      });
      isDatadogInitialized = true;
    } catch (error) {
      Sentry.captureException(new Error('Failed to initialize Datadog RUM'), {
        extra: {
          error,
          env: NODE_ENV,
          hasAppId: Boolean(DATADOG_APPLICATION_ID),
          hasClientToken: Boolean(DATADOG_CLIENT_TOKEN),
        },
      });
    }
  } else if (!DATADOG_APPLICATION_ID || !DATADOG_CLIENT_TOKEN) {
    Sentry.captureMessage('Datadog configuration is missing required values', {
      level: 'warning',
      extra: {
        missingAppId: !DATADOG_APPLICATION_ID,
        missingClientToken: !DATADOG_CLIENT_TOKEN,
      },
    });
  }
}

/**
 * Determines if Datadog RUM should be initialized.
 * @returns {boolean} True if Datadog hasn't been initialized and required configuration is present
 */
function shouldInitializeDatadog(): boolean {
  return (!isDatadogInitialized && DATADOG_APPLICATION_ID && DATADOG_CLIENT_TOKEN) as boolean;
}

export default function DatadogInit() {
  initializeDatadog();
  return null;
}
