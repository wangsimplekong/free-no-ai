import { Request, Response } from 'express';
import { AigcFileDetectionService } from '../../services/aigc/file-detection.service';
import { logger } from '../../utils/logger';
import { successResponse, errorResponse } from '../../utils/response.util';
import { DetectionListRequest } from '../../types/file-detection.types';
import { v4 as uuidv4 } from 'uuid';

export class AigcFileDetectionController {
  constructor(private aigcService: AigcFileDetectionService) {}

  public getDetectionHistory = async (req: Request, res: Response): Promise<void> => {
    const requestId = uuidv4();
    try {
      logger.info('Detection history request received', {
        requestId,
        userId: req.body.userId,
        pageNum: req.body.pageNum,
        pageSize: req.body.pageSize
      });

      const params: DetectionListRequest = {
        userId: req.body.userId,
        pageNum: Number(req.body.pageNum) || 1,
        pageSize: Number(req.body.pageSize) || 10,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        status: req.body.status
      };

      const result = await this.aigcService.getDetectionHistory(params);

      logger.info('Detection history retrieved successfully', {
        requestId,
        total: result.total,
        pages: result.pages
      });

      res.status(200).json(successResponse(result, 'Detection history retrieved successfully'));
    } catch (error) {
      logger.error('Failed to get detection history', {
        requestId,
        error,
        userId: req.body.userId
      });

      const message = error instanceof Error ? error.message : 'Failed to get detection history';
      res.status(400).json(errorResponse(message));
    }
  };

  public getUploadSignature = async (req: Request, res: Response): Promise<void> => {
    const requestId = uuidv4();
    try {
      logger.info('Upload signature request received', {
        requestId,
        ip: req.ip
      });

      const result = await this.aigcService.getUploadSignature();

      logger.info('Upload signature generated', {
        requestId,
        taskId: result.ossid
      });

      res.status(200).json(successResponse(result, 'Upload signature generated successfully'));
    } catch (error) {
      logger.error('Failed to generate upload signature', {
        requestId,
        error
      });

      const message = error instanceof Error ? error.message : 'Failed to generate upload signature';
      res.status(400).json(errorResponse(message));
    }
  }

  public parseDocument = async (req: Request, res: Response): Promise<void> => {
    const requestId = uuidv4();
    try {
      logger.info('Document parse request received', {
        requestId,
        taskId: req.body.taskId,
        fileType: req.body.fileType
      });

      const result = await this.aigcService.parseDocument({
        taskId: req.body.taskId,
        fileType: req.body.fileType
      });

      logger.info('Document parsed successfully', {
        requestId,
        taskId: req.body.taskId,
        wordCount: result.wordCount
      });

      res.status(200).json(successResponse(result, 'Document parsed successfully'));
    } catch (error) {
      logger.error('Failed to parse document', {
        requestId,
        error,
        taskId: req.body.taskId
      });

      const message = error instanceof Error ? error.message : 'Failed to parse document';
      res.status(400).json(errorResponse(message));
    }
  }

  public submitDetection = async (req: Request, res: Response): Promise<void> => {
    const requestId = uuidv4();
    try {
      logger.info('Detection submission request received', {
        requestId,
        taskId: req.body.taskId,
        title: req.body.title
      });

      const result = await this.aigcService.submitDetection(req.body);

      logger.info('Detection submitted successfully', {
        requestId,
        taskId: result.taskId
      });

      res.status(200).json(successResponse(result, 'Detection submitted successfully'));
    } catch (error) {
      logger.error('Failed to submit detection', {
        requestId,
        error,
        taskId: req.body.taskId
      });

      const message = error instanceof Error ? error.message : 'Failed to submit detection';
      res.status(400).json(errorResponse(message));
    }
  }

  public queryResults = async (req: Request, res: Response): Promise<void> => {
    const requestId = uuidv4();
    try {
      logger.info('Results query request received', {
        requestId,
        taskIds: req.body.taskIds
      });

      const result = await this.aigcService.queryDetectionResults({
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
  }
}