import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemberService } from '../../services/member/member.service';
import { MemberModel } from '../../models/member.model';
import { QuotaModel } from '../../models/quota.model';
import { MemberStatus, QuotaType } from '../../types/member.types';

vi.mock('../../models/member.model');
vi.mock('../../models/quota.model');
vi.mock('../../utils/logger');

describe('MemberService', () => {
  let memberService: MemberService;

  beforeEach(() => {
    vi.clearAllMocks();
    memberService = new MemberService();
  });

  describe('subscribe', () => {
    const mockSubscribeDto = {
      plan_id: '123e4567-e89b-12d3-a456-426614174000',
      duration: 1,
      auto_renew: true
    };

    it('should successfully create a subscription', async () => {
      const result = await memberService.subscribe('user-123', mockSubscribeDto);

      expect(result).toEqual({
        order_id: expect.any(String),
        amount: expect.any(Number),
        pay_url: expect.any(String)
      });
    });
  });

  describe('getQuotaStatus', () => {
    const mockQuotas = [
      {
        f_quota_type: QuotaType.DETECTION,
        f_total_quota: 1000,
        f_used_quota: 200,
        f_expire_time: new Date('2024-12-31')
      },
      {
        f_quota_type: QuotaType.REWRITE,
        f_total_quota: 500,
        f_used_quota: 100,
        f_expire_time: new Date('2024-12-31')
      }
    ];

    it('should return quota status for both types', async () => {
      vi.mocked(QuotaModel.getUserQuotas).mockResolvedValue(mockQuotas as any);

      const result = await memberService.getQuotaStatus('user-123');

      expect(result).toEqual({
        detection: {
          total: 1000,
          used: 200,
          remaining: 800,
          expire_time: mockQuotas[0].f_expire_time.toISOString()
        },
        rewrite: {
          total: 500,
          used: 100,
          remaining: 400,
          expire_time: mockQuotas[1].f_expire_time.toISOString()
        }
      });

      expect(QuotaModel.getUserQuotas).toHaveBeenCalledWith('user-123');
    });

    it('should return default values when no quotas found', async () => {
      vi.mocked(QuotaModel.getUserQuotas).mockResolvedValue([]);

      const result = await memberService.getQuotaStatus('user-123');

      expect(result).toEqual({
        detection: {
          total: 0,
          used: 0,
          remaining: 0,
          expire_time: expect.any(String)
        },
        rewrite: {
          total: 0,
          used: 0,
          remaining: 0,
          expire_time: expect.any(String)
        }
      });
    });
  });

  describe('consumeQuota', () => {
    const mockQuota = {
      f_total_quota: 1000,
      f_used_quota: 200,
      f_expire_time: new Date('2024-12-31')
    };

    it('should successfully consume quota', async () => {
      vi.mocked(QuotaModel.findUserQuota).mockResolvedValue(mockQuota as any);
      vi.mocked(QuotaModel.updateQuota).mockResolvedValue();

      const result = await memberService.consumeQuota('user-123', {
        quota_type: QuotaType.DETECTION,
        amount: 100
      });

      expect(result).toEqual({
        success: true,
        remaining: 700
      });

      expect(QuotaModel.updateQuota).toHaveBeenCalledWith(
        'user-123',
        QuotaType.DETECTION,
        300
      );
    });

    it('should throw error when quota not found', async () => {
      vi.mocked(QuotaModel.findUserQuota).mockResolvedValue(null);

      await expect(
        memberService.consumeQuota('user-123', {
          quota_type: QuotaType.DETECTION,
          amount: 100
        })
      ).rejects.toThrow('Quota not found');
    });

    it('should throw error when quota expired', async () => {
      vi.mocked(QuotaModel.findUserQuota).mockResolvedValue({
        ...mockQuota,
        f_expire_time: new Date('2023-12-31')
      } as any);

      await expect(
        memberService.consumeQuota('user-123', {
          quota_type: QuotaType.DETECTION,
          amount: 100
        })
      ).rejects.toThrow('Quota expired');
    });

    it('should throw error when insufficient quota', async () => {
      vi.mocked(QuotaModel.findUserQuota).mockResolvedValue({
        ...mockQuota,
        f_total_quota: 250
      } as any);

      await expect(
        memberService.consumeQuota('user-123', {
          quota_type: QuotaType.DETECTION,
          amount: 100
        })
      ).rejects.toThrow('Insufficient quota');
    });
  });

  describe('getMemberStatus', () => {
    const mockMember = {
      f_status: MemberStatus.NORMAL,
      f_expire_time: new Date('2024-12-31')
    };

    it('should return member status with quotas', async () => {
      vi.mocked(MemberModel.findByUserId).mockResolvedValue(mockMember as any);
      vi.spyOn(memberService, 'getQuotaStatus').mockResolvedValue({
        detection: {
          total: 1000,
          used: 200,
          remaining: 800,
          expire_time: '2024-12-31T00:00:00.000Z'
        },
        rewrite: {
          total: 500,
          used: 100,
          remaining: 400,
          expire_time: '2024-12-31T00:00:00.000Z'
        }
      });

      const result = await memberService.getMemberStatus('user-123');

      expect(result).toEqual({
        status: MemberStatus.NORMAL,
        plan: {
          name: 'Premium Plan',
          end_date: mockMember.f_expire_time.toISOString(),
          quota: expect.any(Object)
        }
      });
    });

    it('should return expired status when no member found', async () => {
      vi.mocked(MemberModel.findByUserId).mockResolvedValue(null);

      const result = await memberService.getMemberStatus('user-123');

      expect(result).toEqual({
        status: MemberStatus.EXPIRED,
        plan: null
      });
    });
  });

  describe('updateAutoRenew', () => {
    it('should successfully update auto renew status', async () => {
      vi.mocked(MemberModel.updateAutoRenew).mockResolvedValue();

      const result = await memberService.updateAutoRenew('user-123', true);

      expect(result).toBe(true);
      expect(MemberModel.updateAutoRenew).toHaveBeenCalledWith('user-123', true);
    });

    it('should throw error when update fails', async () => {
      vi.mocked(MemberModel.updateAutoRenew).mockRejectedValue(new Error('Update failed'));

      await expect(
        memberService.updateAutoRenew('user-123', true)
      ).rejects.toThrow('Update failed');
    });
  });
});