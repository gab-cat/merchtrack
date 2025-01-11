'use client';

import { datadogRum } from '@datadog/browser-rum';
import { version } from '../../../package.json';
import { DATADOG_APPLICATION_ID, DATADOG_CLIENT_TOKEN, NODE_ENV } from '@/config';

let isDatadogInitialized = false;

function initializeDatadog() {
  if (!isDatadogInitialized) {
    datadogRum.init({
      applicationId: DATADOG_APPLICATION_ID,
      clientToken: DATADOG_CLIENT_TOKEN,
      site: 'us5.datadoghq.com',
      service: 'merch-track',
      env: NODE_ENV,
      version: version,
      sessionSampleRate: 20,
      sessionReplaySampleRate: 20,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
      defaultPrivacyLevel: 'mask-user-input',
    });
    isDatadogInitialized = true;
    console.log('Datadog RUM initialized');
  }
}

export default function DatadogInit() {
  initializeDatadog();
  return null;
}
