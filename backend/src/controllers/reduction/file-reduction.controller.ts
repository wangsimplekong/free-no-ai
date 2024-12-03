import { Request, Response } from 'express';
import { AigcFileReductionService } from '../../services/aigc/file-reduction.service';
import { logger } from '../../utils/logger';
import { successResponse, errorResponse } from '../../utils/response.util';
import { ReduceListRequest } from '../../types/file-reduction.types';
import { v4 as uuidv4 } from 'uuid';

export class AigcFileReductionController {
  constructor(private reductionService: AigcFileReductionService) {}

  public getReductionHistory = async (req: Request, res: Response): Promise<void> => {
    const requestId = uuidv4();
    try {
      logger.info('Reduction history request received', {
        requestId,
        userId: req.body.userId,
        pageNum: req.body.pageNum,
        pageSize: req.body.pageSize
      });

      const params: ReduceListRequest = {
        userId: req.body.userId,
        pageNum: Number(req.body.pageNum) || 1,
        pageSize: Number(req.body.pageSize) || 10,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        status: req.body.status
      };

      const result = await this.reductionService.getReductionHistory(params);

      logger.info('Reduction history retrieved successfully', {
        requestId,
        total: result.total,
        pages: result.pages
      });

      res.status(200).json(successResponse(result, 'Reduction history retrieved successfully'));
    } catch (error) {
      logger.error('Failed to get reduction history', {
        requestId,
        error,
        userId: req.body.userId
      });

      const message = error instanceof Error ? error.message : 'Failed to get reduction history';
      res.status(400).json(errorResponse(message));
    }
  };

  public submitReduction = async (req: Request, res: Response): Promise<void> => {
    const requestId = uuidv4();
    try {
      logger.info('Reduction submission request received', {
        requestId,
        taskId: req.body.taskId,
        title: req.body.title
      });

      const result = await this.reductionService.submitReduction(req.body);

      logger.info('Reduction submitted successfully', {
        requestId,
        taskId: result.taskId
      });

      res.status(200).json(successResponse(result, 'Reduction submitted successfully'));
    } catch (error) {
      logger.error('Failed to submit reduction', {
        requestId,
        error,
        taskId: req.body.taskId
      });

      const message = error instanceof Error ? error.message : 'Failed to submit reduction';
      res.status(400).json(errorResponse(message));
    }
  };

  public queryResults = async (req: Request, res: Response): Promise<void> => {
    const requestId = uuidv4();
    try {
      logger.info('Results query request received', {
        requestId,
        taskIds: req.body.taskIds
      });

      const result = await this.reductionService.queryReductionResults({
        taskIds: req.body.taskIds
      });

      logger.info('Results retrieved successfully', {
        requestId,
        resultCount: result.results.length
      });

      res.status(200).json(successResponse(result, 'Results retrieved successfully'));
    } catch (error) {
      logger.error('Failed to query results', {
        requestId,
        error,
        taskIds: req.body.taskIds
      });

      const message = error instanceof Error ? error.message : 'Failed to query results';
      res.status(400).json(errorResponse(message));
    }
  };
}