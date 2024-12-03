import { logger } from '../../utils/logger';
import { sendSMS, validatePhoneNumber } from '../../utils/verification/sms.util';
import { sendEmail, validateEmail } from '../../utils/verification/email.util';
import { VerifyType, VerifyBusinessType } from '../../types/auth/auth.types';
import { RedisManager } from '../../utils/redis/RedisManager';
import { TimeUnits } from '../../utils/redis/constants/TimeUnits';

export class VerificationService {
  private readonly CODE_EXPIRY_MINUTES = 5;
  private readonly MAX_ATTEMPTS = 5;

  private generateRedisKey(recipient: string, type: VerifyType, purpose: VerifyBusinessType): string {
    return `verify:code:${type.toLowerCase()}:${purpose.toLowerCase()}:${recipient}`;
  }

  async sendVerificationCode(
    recipient: string,
    type: VerifyType,
    purpose: VerifyBusinessType
  ): Promise<boolean> {
    try {
      logger.info('Starting verification process', {
        recipient,
        type,
        purpose,
        startTime: new Date().toISOString()
      });

      // Validate contact format based on type
      if (type === VerifyType.SMS && !validatePhoneNumber(recipient)) {
        throw new Error('Invalid phone number format');
      }
      if (type === VerifyType.EMAIL && !validateEmail(recipient)) {
        throw new Error('Invalid email format');
      }

      const redis = await RedisManager.getInstance();
      const redisKey = this.generateRedisKey(recipient, type, purpose);

      // Check for existing active verification
      const existingCode = await redis.get<string>(redisKey);
      if (existingCode) {
        logger.info('Using existing verification code', {
          recipient,
          type,
          purpose,
          expiresIn: await redis.ttl(redisKey)
        });
        return existingCode;
      }

      // Generate verification code
      const code = Math.random().toString().slice(2, 8);

      // Store in Redis with expiration
      await redis.setEx(redisKey, code, this.CODE_EXPIRY_MINUTES, TimeUnits.MINUTES);

      // Send verification code
      if (type === VerifyType.SMS) {
        // await sendSMS(recipient, code);
      } else if (type === VerifyType.EMAIL) {
        // await sendEmail(recipient, code);
      }

      logger.info('Verification code sent successfully', {
        recipient,
        type,
        purpose
      });

      return code;
    } catch (error) {
      logger.error('Verification process failed', {
        error,
        recipient,
        type,
        purpose
      });
      throw error;
    }
  }

  async validateCode(
    recipient: string,
    code: string,
    type: VerifyType,
    purpose: VerifyBusinessType
  ): Promise<boolean> {
    try {
      logger.info('Validating verification code', {
        recipient,
        type,
        purpose,
        startTime: new Date().toISOString()
      });

      const redis = await RedisManager.getInstance();
      const redisKey = this.generateRedisKey(recipient, type, purpose);

      // Get stored code
      const storedCode = await redis.get<string>(redisKey);

      if (!storedCode) {
        logger.warn('No active verification found', {
          recipient,
          type,
          purpose
        });
        return false;
      }

      // Verify code
      const isValid = storedCode == code;

      if (isValid) {
        // Delete the code after successful verification
        await redis.del(redisKey);

        logger.info('Code verification successful', {
          recipient,
          type,
          purpose
        });
      } else {
        logger.warn('Invalid verification code', {
          recipient,
          type,
          purpose
        });
      }

      return isValid;
    } catch (error) {
      logger.error('Code verification failed', {
        error,
        recipient,
        type,
        purpose
      });
      return false;
    }
  }
}

export default new VerificationService();