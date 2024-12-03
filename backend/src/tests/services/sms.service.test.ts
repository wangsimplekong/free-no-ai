import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SMSVerificationService } from '../../services/verification/sms.service';
import { supabase } from '../../config/database';
import { smsConfig } from '../../config/sms.config';
import * as smsUtil from '../../utils/verification/sms.util';
import { VerificationType, VerificationStatus, VerificationPurpose } from '../../models/verification.model';

vi.mock('../../config/database', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: vi.fn()
              }))
            }))
          }))
        })),
        single: vi.fn()
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn()
      }))
    }))
  }
}));

vi.mock('../../utils/verification/sms.util', () => ({
  sendSMS: vi.fn(),
  generateVerificationCode: vi.fn(() => '123456'),
  validatePhoneNumber: vi.fn(() => true),
  normalizePhoneNumber: vi.fn(phone => phone)
}));

describe('SMSVerificationService', () => {
  let smsService: SMSVerificationService;
  const mockPhone = '+1234567890';
  const mockUserId = 'user-123';
  const mockVerificationId = 'verification-123';

  beforeEach(() => {
    smsService = new SMSVerificationService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('send', () => {
    it('should successfully send verification code', async () => {
      const mockVerification = {
        f_id: mockVerificationId,
        f_type: VerificationType.SMS,
        f_status: VerificationStatus.PENDING,
        f_expires_at: new Date(Date.now() + 300000).toISOString()
      };

      vi.mocked(supabase.from).mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({
                  single: () => Promise.resolve({ data: null, error: null })
                })
              })
            })
          })
        }),
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: mockVerification, error: null })
          })
        })
      }));

      vi.mocked(smsUtil.sendSMS).mockResolvedValue(true);

      const result = await smsService.send(
        mockPhone,
        VerificationPurpose.LOGIN,
        mockUserId
      );

      expect(result).toBe(mockVerificationId);
      expect(smsUtil.sendSMS).toHaveBeenCalledWith(
        mockPhone,
        '123456',
        expect.any(String)
      );
    });

    it('should return existing verification if valid', async () => {
      const mockExistingVerification = {
        f_id: 'existing-123',
        f_expires_at: new Date(Date.now() + 300000).toISOString()
      };

      vi.mocked(supabase.from).mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({
                  single: () => Promise.resolve({ data: mockExistingVerification, error: null })
                })
              })
            })
          })
        })
      }));

      const result = await smsService.send(
        mockPhone,
        VerificationPurpose.LOGIN
      );

      expect(result).toBe('existing-123');
      expect(smsUtil.sendSMS).not.toHaveBeenCalled();
    });

    it('should throw error for invalid phone number', async () => {
      vi.mocked(smsUtil.validatePhoneNumber).mockReturnValue(false);

      await expect(
        smsService.send(mockPhone, VerificationPurpose.LOGIN)
      ).rejects.toThrow('Invalid phone number format');
    });

    it('should handle SMS sending failure', async () => {
      vi.mocked(supabase.from).mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => ({
                  single: () => Promise.resolve({ data: null, error: null })
                })
              })
            })
          })
        }),
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({
              data: { f_id: mockVerificationId },
              error: null
            })
          })
        })
      }));

      vi.mocked(smsUtil.sendSMS).mockRejectedValue(new Error('SMS sending failed'));

      await expect(
        smsService.send(mockPhone, VerificationPurpose.LOGIN)
      ).rejects.toThrow('SMS sending failed');
    });
  });

  describe('verify', () => {
    const mockCode = '123456';

    it('should successfully verify code', async () => {
      const mockVerification = {
        f_id: mockVerificationId,
        f_code: mockCode,
        f_status: VerificationStatus.PENDING,
        f_expires_at: new Date(Date.now() + 300000).toISOString(),
        f_attempts: 0,
        f_max_attempts: 3,
        isExpired: () => false,
        isMaxAttemptsReached: () => false,
        incrementAttempts: vi.fn(),
        markAsVerified: vi.fn()
      };

      vi.mocked(supabase.from).mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: mockVerification, error: null })
            })
          })
        })
      }));

      const result = await smsService.verify(mockVerificationId, mockCode);

      expect(result).toBe(true);
      expect(mockVerification.markAsVerified).toHaveBeenCalled();
    });

    it('should throw error for expired verification', async () => {
      const mockVerification = {
        f_id: mockVerificationId,
        f_status: VerificationStatus.PENDING,
        isExpired: () => true,
        isMaxAttemptsReached: () => false
      };

      vi.mocked(supabase.from).mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: mockVerification, error: null })
            })
          })
        }),
        update: () => ({
          eq: () => Promise.resolve({ data: null, error: null })
        })
      }));

      await expect(
        smsService.verify(mockVerificationId, mockCode)
      ).rejects.toThrow('Verification code has expired');
    });

    it('should throw error for max attempts reached', async () => {
      const mockVerification = {
        f_id: mockVerificationId,
        f_status: VerificationStatus.PENDING,
        isExpired: () => false,
        isMaxAttemptsReached: () => true
      };

      vi.mocked(supabase.from).mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: mockVerification, error: null })
            })
          })
        })
      }));

      await expect(
        smsService.verify(mockVerificationId, mockCode)
      ).rejects.toThrow('Maximum verification attempts reached');
    });
  });

  describe('validate', () => {
    it('should return true for valid verification', async () => {
      const mockVerification = {
        f_id: mockVerificationId,
        f_status: VerificationStatus.VERIFIED,
        isExpired: () => false
      };

      vi.mocked(supabase.from).mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              eq: () => ({
                single: () => Promise.resolve({ data: mockVerification, error: null })
              })
            })
          })
        })
      }));

      const result = await smsService.validate(mockVerificationId);
      expect(result).toBe(true);
    });

    it('should return false for expired verification', async () => {
      const mockVerification = {
        f_id: mockVerificationId,
        f_status: VerificationStatus.VERIFIED,
        isExpired: () => true
      };

      vi.mocked(supabase.from).mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              eq: () => ({
                single: () => Promise.resolve({ data: mockVerification, error: null })
              })
            })
          })
        })
      }));

      const result = await smsService.validate(mockVerificationId);
      expect(result).toBe(false);
    });

    it('should return false for non-existent verification', async () => {
      vi.mocked(supabase.from).mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              eq: () => ({
                single: () => Promise.resolve({ data: null, error: new Error('Not found') })
              })
            })
          })
        })
      }));

      const result = await smsService.validate(mockVerificationId);
      expect(result).toBe(false);
    });
  });
});