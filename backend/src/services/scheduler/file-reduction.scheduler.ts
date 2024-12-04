import { logger } from '../../utils/logger';
import { createHttpClient } from '../../utils/http.util';
import { aigcFileConfig } from '../../config/aigc-file.config';
import { FileReductionRepository } from '../../repositories/file-reduction.repository';
import { ReduceTaskStatus } from '../../types/file-reduction.types';

export class FileReductionScheduler {
  private httpClient;
  private reductionRepo: FileReductionRepository;
  private readonly BATCH_SIZE = 50;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  constructor() {
    this.httpClient = createHttpClient(
      aigcFileConfig.reduceUrl,
      aigcFileConfig.timeout
    );
    this.reductionRepo = new FileReductionRepository();
  }

  async syncReductionStatus(): Promise<void> {
    try {
      logger.info('Starting reduction status sync', {
        timestamp: new Date().toISOString(),
      });

      const unfinishedTasks = await this.reductionRepo.findUnfinishedTasks();

      if (unfinishedTasks.length === 0) {
        return;
      }

      for (let i = 0; i < unfinishedTasks.length; i += this.BATCH_SIZE) {
        const batch = unfinishedTasks.slice(i, i + this.BATCH_SIZE);
        const taskIds = batch.map((task) => task.f_third_task_id);

        try {
          for (const taskId of taskIds) {
            const statusResponse = await this.httpClient.get(
              `/port/state/v1.html?report=${taskId}&reportKind=${aigcFileConfig.reduce.reportKind}&key=${aigcFileConfig.reduceApiKey}`
            );
            logger.info(`/port/state/v1.html?report=${taskId}&reportKind=${aigcFileConfig.reduce.reportKind}&key=${aigcFileConfig.reduceApiKey}`);
            logger.info(statusResponse.data)
            if (
              statusResponse.data.code !== 0 ||
              !statusResponse.data.message?.length
            ) {
              throw new Error('Failed to query reduction status');
            }
        
            const taskStatus = statusResponse.data.message[0];
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

            const task = await this.reductionRepo.findByThirdTaskId(taskId);
            if (task) {
              await this.reductionRepo.updateTask(task.f_id, {
                f_status: this.mapTaskStatus(taskStatus.state),
                f_reduce_url: reduceUrl,
                f_recheck_url: recheckUrl,
              });
            }
            
          }
        } catch (error) {
          logger.error(error);
          logger.error('AIGC REDUCTION: Failed to process batch', {
            error,
            taskIds,
            timestamp: new Date().toISOString(),
          });
        }
      }

      logger.info('Reduction status sync completed', {
        processedTasks: unfinishedTasks.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Reduction status sync failed', {
        error,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private mapTaskStatus(state: number): ReduceTaskStatus {
    switch (state) {
      case 0:
        return ReduceTaskStatus.WAITING;
      case 1:
        return ReduceTaskStatus.PENDING;
      case 2:
        return ReduceTaskStatus.COMPLETED;
      default:
        return ReduceTaskStatus.FAILED;
    }
  }

  async retryFailedTasks(): Promise<void> {
    try {
      const failedTasks = await this.reductionRepo.findUnfinishedTasks();

      for (const task of failedTasks) {
        if (task.f_retry_count >= this.MAX_RETRIES) {
          continue;
        }

        try {
          await this.reductionRepo.incrementRetryCount(task.f_id);

          const response = await this.httpClient.post(
            '/internal/aigc-reduce/submit',
            {
              key: aigcFileConfig.reducePlatformKey,
              taskId: task.f_detection_id,
              ...aigcFileConfig.defaultParams,
            },
            {
              headers: { key: aigcFileConfig.reduceApiKey },
            }
          );

          if (response.data.status === '200') {
            await this.reductionRepo.updateTask(task.f_id, {
              f_status: ReduceTaskStatus.PENDING,
              f_third_task_id: response.data.body,
              f_error_msg: null,
            });
          }
        } catch (error) {
          logger.error('Failed to retry task', {
            error,
            taskId: task.f_id,
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      logger.error('Failed to process retry queue', {
        error,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
