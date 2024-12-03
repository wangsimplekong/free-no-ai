import nodemailer from 'nodemailer';
import { logger } from '../logger';

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

// Create Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

export const sendEmail = async (
  to: string,
  code: string,
  config: EmailConfig = DEFAULT_EMAIL_CONFIG
): Promise<boolean> => {
  try {
    const mailOptions = {
      from: config.from,
      to,
      subject: config.subject,
      html: `
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

    const info = await transporter.sendMail(mailOptions);

    logger.info('Email sent successfully', {
      messageId: info.messageId,
      to,
      subject: config.subject
    });

    return true;
  } catch (error) {
    logger.error('Failed to send email', {
      error,
      to,
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