import { Request, Response } from 'express';
import { AigcDetectionService } from '../../services/detection/aigc.service';
import { logger } from '../../utils/logger';
import { successResponse, errorResponse } from '../../utils/response.util';
import { DetectionRequest } from '../../types/detection.types';
import { v4 as uuidv4 } from 'uuid';

export class AigcDetectionController {
  constructor(private aigcService: AigcDetectionService) {}

  private getUserId(req: Request): string {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return userId;
  }

  public detectText = async (req: Request, res: Response): Promise<void> => {
    const requestId = uuidv4();
    try {
      const userId = this.getUserId(req);

      logger.info('Text detection request received', {
        requestId,
        contentLength: req.body.content?.length,
        ip: req.ip,
        userId
      });

      const params: DetectionRequest = {
        content: req.body.content,
        userId
      };

      const result = await this.aigcService.detectText(params);

      logger.info('Text detection completed', {
        requestId,
        result
      });

      res.status(200).json(successResponse(result, 'Detection successful'));
    } catch (error) {
      console.error(error);
      logger.error('Text detection failed', {
        requestId,
        error,
        content: req.body.content?.substring(0, 100) + '...'
      });

      const message = error instanceof Error ? error.message : 'Detection failed';
      res.status(400).json(errorResponse(message));
    }
  }
}