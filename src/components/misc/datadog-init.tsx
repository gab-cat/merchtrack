'use client';

import { datadogRum } from '@datadog/browser-rum';
import { version } from '../../../package.json';
import { DATADOG_APPLICATION_ID, DATADOG_CLIENT_TOKEN, DATADOG_SERVICE, DATADOG_SITE, NODE_ENV } from '@/config';

let isDatadogInitialized = false;

function initializeDatadog() {
  if (shouldInitializeDatadog()) {
    try {
      datadogRum.init({
        applicationId: DATADOG_APPLICATION_ID,
        clientToken: DATADOG_CLIENT_TOKEN,
        site: DATADOG_SITE,
        service: DATADOG_SERVICE,
        env: NODE_ENV,
        version,
        sessionSampleRate: 20,
        sessionReplaySampleRate: 20,
        trackUserInteractions: true,
        trackResources: true,
        trackLongTasks: true,
        defaultPrivacyLevel: 'mask-user-input',
      });
      isDatadogInitialized = true;
      console.log('Datadog RUM initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Datadog RUM:', {
        error,
        env: NODE_ENV,
        hasAppId: Boolean(DATADOG_APPLICATION_ID),
        hasClientToken: Boolean(DATADOG_CLIENT_TOKEN),
      });
    }
  } else if (!DATADOG_APPLICATION_ID || !DATADOG_CLIENT_TOKEN) {
    console.warn('Datadog configuration is missing required values:', {
      missingAppId: !DATADOG_APPLICATION_ID,
      missingClientToken: !DATADOG_CLIENT_TOKEN,
    });
  }
}

function shouldInitializeDatadog() {
  return !isDatadogInitialized && DATADOG_APPLICATION_ID && DATADOG_CLIENT_TOKEN;
}

export default function DatadogInit() {
  initializeDatadog();
  return null;
}
