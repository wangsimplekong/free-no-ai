import { Request, Response } from 'express';
import { BenefitsService } from '../../services/benefits/benefits.service';
import { logger } from '../../utils/logger';
import { successResponse, errorResponse } from '../../utils/response.util';

export class BenefitsController {
  constructor(private benefitsService: BenefitsService) {}

  async getUserBenefits(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }

      logger.info('Fetching user benefits', {
        userId,
        timestamp: new Date().toISOString()
      });

      const benefits = await this.benefitsService.getUserBenefits(userId);

      res.json(successResponse(benefits, 'Benefits retrieved successfully'));
    } catch (error) {
      logger.error('Failed to get user benefits:', error);
      res.status(400).json(errorResponse(
        error instanceof Error ? error.message : 'Failed to get user benefits'
      ));
    }
  }
}