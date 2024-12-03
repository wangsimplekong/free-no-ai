import { Request, Response } from 'express';
import { AigcReduceService } from '../../services/aigc/reduce.service';
import { logger } from '../../utils/logger';
import { successResponse, errorResponse } from '../../utils/response.util';
import { AigcReduceRequest } from '../../types/aigc.types';
import { v4 as uuidv4 } from 'uuid';

export class AigcReduceController {
  constructor(private aigcService: AigcReduceService) {}

  public reduceText = async (req: Request, res: Response): Promise<void> => {
    const requestId = uuidv4();
    try {
      logger.info('Text reduction request received', {
        requestId,
        contentLength: req.body.text?.length,
        ip: req.ip
      });

      const params: AigcReduceRequest = {
        text: req.body.text
      };

      const result = await this.aigcService.reduceText(params.text);

      logger.info('Text reduction completed', {
        requestId,
        originalLength: params.text.length,
        reducedLength: result.length
      });

      res.status(200).json(successResponse({
        text: result
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