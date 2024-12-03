import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { MemberController } from '../../controllers/member/member.controller';
import { MemberService } from '../../services/member/member.service';
import { QuotaType } from '../../types/member.types';

describe('MemberController', () => {
  let memberController: MemberController;
  let memberService: MemberService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    memberService = {
      subscribe: vi.fn(),
      getQuotaStatus: vi.fn(),
      consumeQuota: vi.fn(),
      getMemberStatus: vi.fn(),
      updateAutoRenew: vi.fn(),
    } as any;

    memberController = new MemberController(memberService);

    mockRequest = {
      user: { id: 'user-123' },
      body: {},
    };

    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  describe('subscribe', () => {
    const validSubscribeData = {
      plan_id: '123e4567-e89b-12d3-a456-426614174000',
      duration: 1,
      auto_renew: true
    };

    it('should successfully create subscription', async () => {
      const mockResult = {
        order_id: 'order-123',
        amount: 99.00,
        pay_url: 'https://mock-payment.com/pay'
      };

      mockRequest.body = validSubscribeData;
      vi.mocked(memberService.subscribe).mockResolvedValue(mockResult);

      await memberController.subscribe(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        code: 200,
        message: 'Success',
        data: mockResult,
        timestamp: expect.any(Number)
      });
    });

    it('should handle validation errors', async () => {
      mockRequest.body = { ...validSubscribeData, duration: -1 };

      await memberController.subscribe(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        code: 400,
        message: expect.any(String),
        timestamp: expect.any(Number)
      });
    });
  });

  describe('getQuotaStatus', () => {
    it('should return quota status', async () => {
      const mockQuotaStatus = {
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
      };

      vi.mocked(memberService.getQuotaStatus).mockResolvedValue(mockQuotaStatus);

      await memberController.getQuotaStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        code: 200,
        message: 'Success',
        data: mockQuotaStatus,
        timestamp: expect.any(Number)
      });
    });
  });

  describe('consumeQuota', () => {
    const validConsumeData = {
      quota_type: QuotaType.DETECTION,
      amount: 100
    };

    it('should successfully consume quota', async () => {
      const mockResult = {
        success: true,
        remaining: 700
      };

      mockRequest.body = validConsumeData;
      vi.mocked(memberService.consumeQuota).mockResolvedValue(mockResult);

      await memberController.consumeQuota(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        code: 200,
        message: 'Success',
        data: mockResult,
        timestamp: expect.any(Number)
      });
    });

    it('should handle insufficient quota', async () => {
      mockRequest.body = validConsumeData;
      vi.mocked(memberService.consumeQuota).mockRejectedValue(
        new Error('Insufficient quota')
      );

      await memberController.consumeQuota(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        code: 400,
        message: 'Insufficient quota',
        timestamp: expect.any(Number)
      });
    });
  });

  describe('getMemberStatus', () => {
    it('should return member status', async () => {
      const mockStatus = {
        status: 1,
        plan: {
          name: 'Premium Plan',
          end_date: '2024-12-31T00:00:00.000Z',
          quota: {}
        }
      };

      vi.mocked(memberService.getMemberStatus).mockResolvedValue(mockStatus);

      await memberController.getMemberStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        code: 200,
        message: 'Success',
        data: mockStatus,
        timestamp: expect.any(Number)
      });
    });
  });

  describe('updateAutoRenew', () => {
    it('should successfully update auto renew status', async () => {
      mockRequest.body = { auto_renew: true };
      vi.mocked(memberService.updateAutoRenew).mockResolvedValue(true);

      await memberController.updateAutoRenew(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        code: 200,
        message: 'Success',
        data: { success: true },
        timestamp: expect.any(Number)
      });
    });
  });
});