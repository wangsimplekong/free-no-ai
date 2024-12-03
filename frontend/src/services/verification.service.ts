import { api } from '../lib/api';
import { VerificationType, VerificationPurpose } from '../types/auth.types';

export interface SendVerificationRequest {
  recipient: string;
  type: VerificationType;
  purpose: VerificationPurpose;
  userId?: string;
}

export interface VerifyCodeRequest {
  verificationId: string;
  code: string;
  type: VerificationType;
  state?: string; // For WeChat OAuth
}

export interface VerificationResponse {
  verificationId: string;
  url?: string; // For WeChat OAuth
}

class VerificationService {
  /**
   * Send verification code
   */
  async sendVerification(params: SendVerificationRequest): Promise<VerificationResponse> {
    const response = await api.post('/api/auth/verification/send', params);
    return response.data.data;
  }

  /**
   * Verify code
   */
  async verifyCode(params: VerifyCodeRequest): Promise<boolean> {
    const response = await api.post('/api/auth/verification/verify', params);
    return response.data.success;
  }

  /**
   * Send SMS verification
   */
  async sendSMSVerification(
    phone: string,
    purpose: VerificationPurpose,
    userId?: string
  ): Promise<string> {
    const response = await this.sendVerification({
      recipient: phone,
      type: VerificationType.SMS,
      purpose,
      userId
    });
    return response.verificationId;
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(
    email: string,
    purpose: VerificationPurpose,
    userId?: string
  ): Promise<string> {
    const response = await this.sendVerification({
      recipient: email,
      type: VerificationType.EMAIL,
      purpose,
      userId
    });
    return response.verificationId;
  }

  /**
   * Get WeChat OAuth URL
   */
  async getWeChatAuthUrl(
    purpose: VerificationPurpose,
    userId?: string
  ): Promise<VerificationResponse> {
    return this.sendVerification({
      recipient: 'wechat_oauth',
      type: VerificationType.WECHAT,
      purpose,
      userId
    });
  }

  /**
   * Verify SMS code
   */
  async verifySMSCode(verificationId: string, code: string): Promise<boolean> {
    return this.verifyCode({
      verificationId,
      code,
      type: VerificationType.SMS
    });
  }

  /**
   * Verify email code
   */
  async verifyEmailCode(verificationId: string, code: string): Promise<boolean> {
    return this.verifyCode({
      verificationId,
      code,
      type: VerificationType.EMAIL
    });
  }

  /**
   * Handle WeChat OAuth callback
   */
  async handleWeChatCallback(
    verificationId: string,
    code: string,
    state: string
  ): Promise<boolean> {
    return this.verifyCode({
      verificationId,
      code,
      type: VerificationType.WECHAT,
      state
    });
  }
}

export const verificationService = new VerificationService();