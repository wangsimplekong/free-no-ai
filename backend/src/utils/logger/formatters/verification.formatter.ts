import { VerificationType, VerificationPurpose } from '../../../models/verification.model';

export interface VerificationLogContext {
  verificationId?: string;
  type: VerificationType;
  purpose: VerificationPurpose;
  recipient: string;
  attempts?: number;
  maxAttempts?: number;
  expiresAt?: Date;
  metadata?: Record<string, any>;
}

export const formatVerificationLog = (context: VerificationLogContext) => {
  return {
    verification: {
      id: context.verificationId,
      type: context.type,
      purpose: context.purpose,
      recipient: context.recipient,
      attempts: context.attempts,
      maxAttempts: context.maxAttempts,
      expiresAt: context.expiresAt?.toISOString(),
      ...context.metadata
    },
    timestamp: new Date().toISOString()
  };
};