import { createTransport } from 'nodemailer';
import RPCClient from '@alicloud/pop-core';
import { logger } from '../logger';
import crypto from 'crypto';

export interface EmailConfig {
  from: string;
  subject: string;
  templateId?: string;
  expiresIn: number; // in minutes
}

export const DEFAULT_EMAIL_CONFIG: EmailConfig = {
  from: process.env.GMAIL_USER || '',
  subject: 'Verification Code',
  expiresIn: 15
};

// 配置常量
const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM ,
  fromAlias: process.env.EMAIL_FROM_ALIAS ,
  accessKey: process.env.ALIYUN_ACCESS_KEY ,
  secretKey: process.env.ALIYUN_SECRET_KEY ,
  region: process.env.ALIYUN_REGION
};

// 创建阿里云 DirectMail 客户端
const client = new RPCClient({
  accessKeyId: EMAIL_CONFIG.accessKey,
  accessKeySecret: EMAIL_CONFIG.secretKey,
  endpoint: `https://dm.${EMAIL_CONFIG.region}.aliyuncs.com`,
  apiVersion: '2015-11-23'
});

export const sendEmail = async (
    to: string,
    code: string,
    config: EmailConfig = DEFAULT_EMAIL_CONFIG
): Promise<boolean> => {
  const requestId = crypto.randomBytes(4).toString('hex');

  try {
    logger.info(`[EMAIL][${requestId}] Preparing to send email - To: ${to}, Subject: ${config.subject}`);

    const params = {
      AccountName: EMAIL_CONFIG.from,
      FromAlias: EMAIL_CONFIG.fromAlias,
      AddressType: 1,
      TagName: 'verification',
      ReplyToAddress: false,
      ToAddress: to,
      Subject: config.subject,
      HtmlBody: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Verification Code</h2>
          <p style="color: #666; font-size: 16px;">Your verification code is:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; color: #333;">${code}</span>
          </div>
          <p style="color: #666; font-size: 14px;">
            This code will expire in ${config.expiresIn} minutes.<br>
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      `
    };

    logger.debug(`[EMAIL][${requestId}] Mail options:`, params);

    const result = await client.request('SingleSendMail', params, { method: 'POST' });

    logger.info(`[EMAIL][${requestId}] Email sent successfully - To: ${to}`);

    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    logger.error(`[EMAIL][${requestId}] Failed to send email - To: ${to}, Error: ${errorMessage}`, {
      error,
      config
    });

    throw new Error('Failed to send email verification code');
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const generateVerificationCode = (length: number = 6): string => {
  return Math.random()
      .toString()
      .slice(2, 2 + length);
};