import { createHttpClient } from '../../utils/http.util';
import { aigcFileConfig } from '../../config/aigc-file.config';
import { logger } from '../../utils/logger';
import { FileDetectionRepository, DetectionListResponse } from '../../repositories/file-detection.repository';
import { DetectionTaskStatus } from '../../types/file-detection.types';
import { DetectionListRequest } from '../../types/file-detection.types';
import {
  UploadSignatureResponse,
  ParseDocRequest,
  ParseDocResponse,
  FileDetectionRequest,
  FileDetectionResponse,
  QueryDetectionRequest,
  QueryDetectionResponse,
  DetectionResult,
} from '../../types/aigc-file.types';

export class AigcFileDetectionService {
  private httpClient;
  private detectionRepo: FileDetectionRepository;

  constructor() {
    this.httpClient = createHttpClient(
      aigcFileConfig.apiUrl,
      aigcFileConfig.timeout
    );
    this.detectionRepo = new FileDetectionRepository();
  }

  async getUploadSignature(): Promise<UploadSignatureResponse> {
    try {
      const response = await this.httpClient.post(
        '/external/aigc-task/query-upload-info',
        { key: aigcFileConfig.platformKey },
        {
          headers: { key: aigcFileConfig.apiKey },
        }
      );

      if (response.data.status !== '200') {
        throw new Error(
          response.data.message || 'Failed to get upload signature'
        );
      }

      return response.data.body;
    } catch (error) {
      logger.error('Failed to get upload signature:', error);
      throw error;
    }
  }

  async parseDocument(params: ParseDocRequest): Promise<ParseDocResponse> {
    try {
      const response = await this.httpClient.post(
        '/external/aigc-task/parse-doc-info',
        {
          key: aigcFileConfig.platformKey,
          ...params,
        },
        {
          headers: { key: aigcFileConfig.apiKey },
        }
      );

      if (response.data.status !== '200') {
        throw new Error(response.data.message || 'Failed to parse document');
      }

      return response.data.body;
    } catch (error) {
      logger.error('Failed to parse document:', error);
      throw error;
    }
  }

  async submitDetection(
    params: FileDetectionRequest
  ): Promise<FileDetectionResponse> {
    try {
      params.userId = 123456;
      // Create detection task record in database
      const task = await this.detectionRepo.createDetectionTask({
        userId: params.userId,
        title: params.title,
        wordCount: params.wordCount,
        sourceFileUrl: params.sourceFileUrl,
        sourceFileType: params.sourceFileType,
      });

      // Submit to third-party service
      const response = await this.httpClient.post(
        '/external/aigc-task/post',
        {
          key: aigcFileConfig.platformKey,
          ...params,
          ...aigcFileConfig.defaultParams,
        },
        {
          headers: { key: aigcFileConfig.apiKey },
        }
      );

      if (response.data.status !== '200') {
        // Update task status to failed if submission fails
        await this.detectionRepo.updateTask(task.f_id, {
          f_status: DetectionTaskStatus.FAILED,
          f_error_msg: response.data.message || 'Failed to submit detection',
        });
        throw new Error(response.data.message || 'Failed to submit detection');
      }

      logger.info("Starting update status... ")
      // Update task with third-party task ID
      await this.detectionRepo.updateTask(task.f_id, {
        f_status: DetectionTaskStatus.SUBMITTED,
        f_third_task_id: response.data.body,
      });

      return { taskId: response.data.body };
    } catch (error) {
      logger.error('Failed to submit detection:', error);
      throw error;
    }
  }

  async queryDetectionResults(
    params: QueryDetectionRequest
  ): Promise<QueryDetectionResponse> {
    try {
      const response = await this.httpClient.post(
        '/external/aigc-task/query',
        {
          key: aigcFileConfig.platformKey,
          taskIds: params.taskIds,
        },
        {
          headers: { key: aigcFileConfig.apiKey },
        }
      );

      if (response.data.status !== '200') {
        throw new Error(
          response.data.message || 'Failed to query detection results'
        );
      }

      // Update local task records with results
      for (const result of response.data.body) {
        const task = await this.detectionRepo.findByThirdTaskId(result.taskId);
        if (task) {
          await this.detectionRepo.updateTask(task.f_id, {
            f_status: this.mapTaskStatus(result.state),
            f_similarity: result.similarity,
            f_report_url: result.zipurl,
          });
        }
      }

      return { results: response.data.body };
    } catch (error) {
      logger.error('Failed to query detection results:', error);
      throw error;
    }
  }

  async getDetectionHistory(params: DetectionListRequest): Promise<DetectionListResponse> {
    try {
      logger.info('Getting detection history', {
        userId: params.userId,
        pageNum: params.pageNum,
        pageSize: params.pageSize,
        timestamp: new Date().toISOString()
      });

      const result = await this.detectionRepo.findDetectionHistory(params);

      logger.info('Detection history retrieved', {
        total: result.total,
        pages: result.pages,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      logger.error('Failed to get detection history', {
        error,
        params,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  private mapTaskStatus(state: number): DetectionTaskStatus {
    switch (state) {
      case 0:
        return DetectionTaskStatus.PENDING;
      case 1:
        return DetectionTaskStatus.PROCESSING;
      case 2:
        return DetectionTaskStatus.SUBMITTED;
      case 3:
        return DetectionTaskStatus.COMPLETED;
      default:
        return DetectionTaskStatus.FAILED;
    }
  }
}