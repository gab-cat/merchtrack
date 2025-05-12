

// Export all configurations from each domain
export * from './app';
export * from './auth';
export * from './database';
export * from './monitoring';
export * from './storage';
export * from './communication';

// Re-export all configs as objects for convenience
import { appConfig } from './app';
import { authConfig } from './auth';
import { dbConfig } from './database';
import { monitoringConfig } from './monitoring';
import { storageConfig } from './storage';
import { communicationConfig } from './communication';

// Export a single object with all configurations for easy access
export const config = {
  app: appConfig,
  auth: authConfig,
  db: dbConfig,
  monitoring: monitoringConfig,
  storage: storageConfig,
  communication: communicationConfig,
};



