import { createHttpClient } from '../../utils/http.util';
import { aigcFileConfig } from '../../config/aigc-file.config';
import { logger } from '../../utils/logger';
import { FileReductionRepository } from '../../repositories/file-reduction.repository';
import { FileDetectionRepository } from '../../repositories/file-detection.repository';
import {
  ReduceTaskStatus,
  ReduceListRequest,
  ReduceListResponse,
  ReduceSubmitRequest,
  ReduceSubmitResponse,
  QueryReduceRequest,
  QueryReduceResponse,
} from '../../types/file-reduction.types';
import { DetectionTaskStatus } from '../../types/file-detection.types';
import { QuotaModel } from '../../models/quota.model';
import { QuotaType, QuotaChangeType } from '../../types/member.types';

export class AigcFileReductionService {
  private httpClient;
  private detectionHttpClient;
  private reductionRepo: FileReductionRepository;
  private detectionRepo: FileDetectionRepository;
  private quotaModel: QuotaModel;

  constructor() {
    this.httpClient = createHttpClient(
      aigcFileConfig.reduceUrl,
      aigcFileConfig.timeout
    );
    this.detectionHttpClient = createHttpClient(
      aigcFileConfig.apiUrl,
      aigcFileConfig.timeout
    );
    this.reductionRepo = new FileReductionRepository();
    this.detectionRepo = new FileDetectionRepository();
    this.quotaModel = new QuotaModel();
  }

  async getReductionHistory(
    params: ReduceListRequest
  ): Promise<ReduceListResponse> {
    try {
      logger.info('Getting reduction history', {
        userId: params.userId,
        pageNum: params.pageNum,
        pageSize: params.pageSize,
        timestamp: new Date().toISOString(),
      });
      
      logger.info(params)
      const result = await this.reductionRepo.findReductionHistory(params);

      logger.info('Reduction history retrieved', {
        total: result.total,
        pages: result.pages,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      logger.error('Failed to get reduction history:', error);
      throw error;
    }
  }

  async submitReduction(
    params: ReduceSubmitRequest
  ): Promise<ReduceSubmitResponse> {
    try {
      logger.info('Submitting reduction task', {
        taskId: params.taskId,
        userId: params.userId,
        title: params.title,
        wordCount: params.wordCount,
        timestamp: new Date().toISOString(),
      });

      // Record quota usage before making the API call
      const quotaParams = {
        user_id: params.userId,
        quota_type: QuotaType.REWRITE,
        change_type: QuotaChangeType.CONSUME,
        change_amount: params.wordCount,
        remark: `降重任务：${params.title}`
      };
      logger.info('Creating quota record with params:', quotaParams);
      await this.quotaModel.createQuotaRecord(quotaParams);

      // First submit detection task
      const detectionResponse = await this.detectionHttpClient.post(
        '/external/aigc-task/post',
        {
          key: aigcFileConfig.platformKey,
          ...params,
          userId: 123456,
          ...aigcFileConfig.defaultParams,
        },
        {
          headers: { key: aigcFileConfig.apiKey },
        }
      );

      if (detectionResponse.data.status !== '200') {
        throw new Error(detectionResponse.data.message || 'Failed to submit detection');
      }

      // Create detection task record
      const detectionTask = await this.detectionRepo.createDetectionTask({
        userId: params.userId,
        title: params.title,
        wordCount: params.wordCount,
        sourceFileUrl: params.sourceFileUrl,
        sourceFileType: params.sourceFileType,
        f_third_task_id: detectionResponse.data.body,
        f_status: DetectionTaskStatus.SUBMITTED,
      });

      // Create reduction task record
      const reductionTask = await this.reductionRepo.createReductionTask({
        userId: params.userId,
        title: params.title,
        wordCount: params.wordCount,
        detectionId: detectionResponse.data.body,
      });

      // Submit reduction to third-party service
      const reductionResponse = await this.httpClient.post(
        `/port/submit/v1.html?key=${aigcFileConfig.reduceApiKey}`,
        {
          report: detectionResponse.data.body,
          sign: aigcFileConfig.reducePlatformKey,
          jcType: aigcFileConfig.reduce.type,
          reportKind: aigcFileConfig.reduce.reportKind,
          checkThesis: aigcFileConfig.reduce.checkThesis,
          title: params.title,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (reductionResponse.data.code !== '0' && reductionResponse.data.code !== 0) {
        await this.reductionRepo.updateTask(reductionTask.f_id, {
          f_status: ReduceTaskStatus.FAILED,
          f_error_msg: reductionResponse.data.msg || 'Failed to submit reduction',
        });
        throw new Error(reductionResponse.data.msg || 'Failed to submit reduction');
      }

      // Update reduction task with third-party task ID
      await this.reductionRepo.updateTask(reductionTask.f_id, {
        f_status: ReduceTaskStatus.PENDING,
        f_third_task_id: detectionResponse.data.body,
      });

      return { taskId: detectionResponse.data.body };
    } catch (error) {
      logger.error(error);
      logger.error('Failed to submit reduction:', error);
      throw error;
    }
  }

  async queryReductionResults(
    params: QueryReduceRequest
  ): Promise<QueryReduceResponse> {
    try {
      const results = await Promise.all(
        params.taskIds.map(async (taskId) => {
          // Query task status
          const statusResponse = await this.httpClient.get(
            `/port/state/v1.html?report=${taskId}&reportKind=${aigcFileConfig.reduce.reportKind}&key=${aigcFileConfig.reduceApiKey}`
          );
          
          if (
            statusResponse.data.code !== 0 ||
            !statusResponse.data.message?.length
          ) {
            throw new Error('Failed to query reduction status');
          }

          const taskStatus = statusResponse.data.message[0];

          // If task is completed, get the report URLs
          let reduceUrl, recheckUrl;
          if (taskStatus.state === 2) {
            const reportResponse = await this.httpClient.get(
              `/port/new-report/v2?taskId=${taskId}-aigc&key=${aigcFileConfig.reduceApiKey}`
            );
            if (reportResponse.data.code === 0) {
              reduceUrl = reportResponse.data.data.resultDoc;
              recheckUrl = reportResponse.data.data.resultHtml;
            }
          }

          return {
            taskId,
            state: taskStatus.state,
            reduceUrl,
            recheckUrl,
            reduceRate: taskStatus.similarity
              ? parseFloat(taskStatus.similarity)
              : undefined,
            processTime: taskStatus.updateSentenceCount,
          };
        })
      );

      // Update local task records with results
      for (const result of results) {
        const task = await this.reductionRepo.findByThirdTaskId(result.taskId);
        if (task) {
          await this.reductionRepo.updateTask(task.f_id, {
            f_status: this.mapTaskStatus(result.state),
            f_reduce_url: result.reduceUrl,
            f_recheck_url: result.recheckUrl,
            f_reduce_rate: result.reduceRate,
            f_process_time: result.processTime,
          });
        }
      }

      return { results };
    } catch (error) {
      logger.error('Failed to query reduction results:', error);
      throw error;
    }
  }

  private mapTaskStatus(state: number): ReduceTaskStatus {
    switch (state) {
      case 0:
        return ReduceTaskStatus.WAITING;
      case 1:
        return ReduceTaskStatus.PROCESSING;
      case 2:
        return ReduceTaskStatus.COMPLETED;
      default:
        return ReduceTaskStatus.FAILED;
    }
  }
}
