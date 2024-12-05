import { Request, Response } from 'express';
import { AigcReduceService } from '../../services/aigc/reduce.service';
import { logger } from '../../utils/logger';
import { successResponse, errorResponse } from '../../utils/response.util';
import { v4 as uuidv4 } from 'uuid';

export class AigcReduceController {
  constructor(private aigcService: AigcReduceService) {}

  private getUserId(req: Request): string {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new Error('User not authenticated');
    }
    return userId;
  }

  public reduceText = async (req: Request, res: Response): Promise<void> => {
    const requestId = uuidv4();
    try {
      const userId = this.getUserId(req);

      logger.info('Text reduction request received', {
        requestId,
        contentLength: req.body.text?.length,
        userId,
        ip: req.ip
      });

      const params = {
        content: req.body.text,
        userId
      };

      const result = await this.aigcService.reduceText(params);

      logger.info('Text reduction completed', {
        requestId,
        originalLength: params.content.length,
        reducedLength: result.result.length
      });

      res.status(200).json(successResponse({
        text: result.result
      }, 'Text reduction successful'));
    } catch (error) {
      logger.error('Text reduction failed', {
        requestId,
        error,
        text: req.body.text?.substring(0, 100) + '...'
      });

      const message = error instanceof Error ? error.message : 'Text reduction failed';
      res.status(400).json(errorResponse(message));
    }
  }
}