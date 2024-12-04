import axios from 'axios';
import crypto from 'crypto';
import { logger } from '../logger';
import { smsConfig } from '../../config/sms.config';

// Create axios instance with default config
const smsClient = axios.create({
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json'
  }
});

function generateSignature(templateCode: string, mobile: string, appName: string, timestamp: string): string {
  const signString = `${templateCode}${mobile}${appName}${timestamp}`;
  return crypto.createHash('md5').update(signString).digest('hex');
}

async function retryRequest(fn: () => Promise<any>, retries = 3, delay = 1000): Promise<any> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;

    logger.warn('Retrying SMS request after error', {
      retriesLeft: retries - 1,
      delay,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    await new Promise(resolve => setTimeout(resolve, delay));
    return retryRequest(fn, retries - 1, delay * 2);
  }
}

export const sendSMS = async (
    phone: string,
    code: string,
    templateId?: string
): Promise<boolean> => {
  const requestId = crypto.randomBytes(4).toString('hex');

  try {
    logger.info(`[SMS][${requestId}] Preparing to send SMS - Phone: ${phone}, Template: ${smsConfig.templateCode}`);

    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = generateSignature(
        smsConfig.templateCode,
        phone,
        smsConfig.appName,
        timestamp
    );

    const payload = {
      templateCode: smsConfig.templateCode,
      mobile: phone,
      content: JSON.stringify({ code }),
      appName: smsConfig.appName,
      t: timestamp,
      sign: signature
    };

    const url = `${smsConfig.gatewayUrl}?key=${smsConfig.gatewayKey}`;

    logger.debug(`[SMS][${requestId}] Request payload: ${JSON.stringify(payload)}`);

    const response = await retryRequest(async () => {
      const resp = await smsClient.post(url, payload);
      return resp;
    });

    logger.info(`[SMS][${requestId}] Response received - Status: ${response.status}, Data: ${JSON.stringify(response.data)}`);

    if (response.status !== 200) {
      throw new Error(`SMS gateway returned status ${response.status}`);
    }

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = axios.isAxiosError(error)
        ? JSON.stringify({
          response: error.response?.data,
          status: error.response?.status
        })
        : '';

    logger.error(`[SMS][${requestId}] Failed to send SMS - Phone: ${phone}, Error: ${errorMessage} ${errorDetails}`);
    throw error;
  }
};

export const generateVerificationCode = (length: number = 6): string => {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += digits[Math.floor(Math.random() * digits.length)];
  }
  return code;
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Supports international phone numbers with country codes
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

export const normalizePhoneNumber = (phone: string): string => {
  // Remove all non-digit characters except leading +
  return phone.replace(/[^\d+]/g, '');
};