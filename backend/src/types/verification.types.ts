import { VerificationType, VerificationPurpose } from '../models/verification.model';

export interface SendVerificationDTO {
  recipient: string;
  type: VerificationType;
  purpose: VerificationPurpose;
  userId?: string;
}

export interface VerifyCodeDTO {
  verificationId: string;
  code: string;
}

export interface VerificationResult {
  success: boolean;
  message: string;
  verificationId?: string;
}