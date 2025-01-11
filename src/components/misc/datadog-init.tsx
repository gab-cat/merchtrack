'use client';

import { datadogRum } from '@datadog/browser-rum';
import { version } from '../../../package.json';
import { DATADOG_APPLICATION_ID, DATADOG_CLIENT_TOKEN, DATADOG_SERVICE, DATADOG_SITE, NODE_ENV } from '@/config';

let isDatadogInitialized = false;

function initializeDatadog() {
  if (!isDatadogInitialized) {
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
  }
}

export default function DatadogInit() {
  initializeDatadog();
  return null;
}
