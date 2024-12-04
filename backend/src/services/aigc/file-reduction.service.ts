import { createHttpClient } from '../../utils/http.util';
import { aigcFileConfig } from '../../config/aigc-file.config';
import { logger } from '../../utils/logger';
import { FileReductionRepository } from '../../repositories/file-reduction.repository';
import {
  ReduceTaskStatus,
  ReduceListRequest,
  ReduceListResponse,
  ReduceSubmitRequest,
  ReduceSubmitResponse,
  QueryReduceRequest,
  QueryReduceResponse,
} from '../../types/file-reduction.types';
import { log } from 'console';

export class AigcFileReductionService {
  private httpClient;
  private reductionRepo: FileReductionRepository;

  constructor() {
    this.httpClient = createHttpClient(
      aigcFileConfig.reduceUrl,
      aigcFileConfig.timeout
    );
    this.reductionRepo = new FileReductionRepository();
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
        timestamp: new Date().toISOString(),
      });

      // Create reduction task record
      const task = await this.reductionRepo.createReductionTask({
        userId: params.userId,
        title: params.title,
        wordCount: params.wordCount,
        detectionId: params.taskId,
      });

      // Submit to third-party service
      const response = await this.httpClient.post(
        `/port/submit/v1.html?key=${aigcFileConfig.reduceApiKey}`,
        {
          report: params.taskId,
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

      if (response.data.code !== '0' && response.data.code !== 0) {
        await this.reductionRepo.updateTask(task.f_id, {
          f_status: ReduceTaskStatus.FAILED,
          f_error_msg: response.data.msg || 'Failed to submit reduction',
        });
        throw new Error(response.data.msg || 'Failed to submit reduction');
      }

      // Update task with third-party task ID
      await this.reductionRepo.updateTask(task.f_id, {
        f_status: ReduceTaskStatus.PENDING,
        f_third_task_id: task.f_detection_id,
      });

      return { taskId: task.f_detection_id};
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
