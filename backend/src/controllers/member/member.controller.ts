import { Request, Response } from 'express';
import { MemberService } from '../../services/member/member.service';
import { SubscribeDTO } from '../../dto/member/subscribe.dto';
import { QuotaConsumeDTO } from '../../dto/member/quota.dto';
import { successResponse, errorResponse } from '../../utils/response.util';
import { logger } from '../../utils/logger';

export class MemberController {
  constructor(private memberService: MemberService) {}

  async subscribe(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.body.userId; // Get userId from request body instead of auth
      const dto = SubscribeDTO.parse(req.body);
      
      const result = await this.memberService.subscribe(userId, dto);
      
      res.status(200).json(successResponse(result));
    } catch (error) {
      logger.error('Subscription error:', error);
      res.status(400).json(errorResponse(error instanceof Error ? error.message : 'Subscription failed'));
    }
  }

  async getQuotaStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.query.userId as string; // Get userId from query params
      const result = await this.memberService.getQuotaStatus(userId);
      
      res.status(200).json(successResponse(result));
    } catch (error) {
      logger.error('Error getting quota status:', error);
      res.status(400).json(errorResponse(error instanceof Error ? error.message : 'Failed to get quota status'));
    }
  }

  async consumeQuota(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.body.userId; // Get userId from request body
      const dto = QuotaConsumeDTO.parse(req.body);
      
      const result = await this.memberService.consumeQuota(userId, dto);
      
      res.status(200).json(successResponse(result));
    } catch (error) {
      logger.error('Error consuming quota:', error);
      res.status(400).json(errorResponse(error instanceof Error ? error.message : 'Failed to consume quota'));
    }
  }

  async getMemberStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.query.userId as string; // Get userId from query params
      const result = await this.memberService.getMemberStatus(userId);
      
      res.status(200).json(successResponse(result));
    } catch (error) {
      logger.error('Error getting member status:', error);
      res.status(400).json(errorResponse(error instanceof Error ? error.message : 'Failed to get member status'));
    }
  }

  async updateAutoRenew(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.body.userId; // Get userId from request body
      const { auto_renew } = req.body;
      
      const result = await this.memberService.updateAutoRenew(userId, auto_renew);
      
      res.status(200).json(successResponse({ success: result }));
    } catch (error) {
      logger.error('Error updating auto renew:', error);
      res.status(400).json(errorResponse(error instanceof Error ? error.message : 'Failed to update auto renew'));
    }
  }
}

export default new MemberController(new MemberService());