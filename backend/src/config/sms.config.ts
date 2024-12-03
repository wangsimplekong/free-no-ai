import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

export interface SMSConfig {
  gatewayUrl: string;
  gatewayKey: string;
  templateCode: string;
  appName: string;
  retryAttempts: number;
  retryDelay: number; // milliseconds
  timeout: number; // milliseconds
}

const validateConfig = (config: SMSConfig): void => {
  const requiredFields = ['gatewayUrl', 'gatewayKey', 'templateCode', 'appName'];
  const missingFields = requiredFields.filter(field => !config[field as keyof SMSConfig]);

  if (missingFields.length > 0) {
    const error = `Missing required SMS gateway configuration: ${missingFields.join(', ')}`;
    logger.error(error);
    throw new Error(error);
  }
};

export const smsConfig: SMSConfig = {
  gatewayUrl: process.env.SMS_GATEWAY_URL || '',
  gatewayKey: process.env.SMS_GATEWAY_KEY || '',
  templateCode: process.env.SMS_TEMPLATE_CODE || '',
  appName: process.env.SMS_APP_NAME || '',
  retryAttempts: 3,
  retryDelay: 1000,
  timeout: 5000
};

try {
  validateConfig(smsConfig);
  logger.info('SMS configuration loaded successfully', {
    gatewayUrl: smsConfig.gatewayUrl,
    templateCode: smsConfig.templateCode,
    appName: smsConfig.appName
  });
} catch (error) {
  logger.error('Failed to load SMS configuration', { error });
  throw error;
}

export default smsConfig;