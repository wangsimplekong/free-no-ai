import { Request, Response } from 'express';
import { MemberPlanService } from '../../services/member/plan.service';
import { logger } from '../../utils/logger';
import { successResponse, errorResponse } from '../../utils/response.util';

export class MemberPlanController {
  constructor(private memberPlanService: MemberPlanService) {}

  public getPlans = async (_req: Request, res: Response): Promise<void> => {
    try {
      logger.info('Fetching member plans');
      const plans = await this.memberPlanService.getAllPlans();
      
      res.status(200).json(successResponse(plans, 'Member plans retrieved successfully'));
    } catch (error) {
      logger.error('Failed to fetch member plans:', error);
      res.status(400).json(errorResponse(
        error instanceof Error ? error.message : 'Failed to fetch member plans'
      ));
    }
  };
}