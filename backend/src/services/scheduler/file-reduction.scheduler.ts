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
          const response = await this.httpClient.post(
            '/internal/aigc-reduce/query',
            {
              key: aigcFileConfig.reducePlatformKey,
              taskIds,
            },
            {
              headers: { key: aigcFileConfig.reduceApiKey },
            }
          );

          if (response.data.status === '200') {
            for (const result of response.data.body) {
              const task = await this.reductionRepo.findByThirdTaskId(
                result.taskId
              );
              if (task) {
                await this.reductionRepo.updateTask(task.f_id, {
                  status: this.mapTaskStatus(result.state),
                  reduceUrl: result.reduceUrl,
                  recheckUrl: result.recheckUrl,
                  reduceRate: result.reduceRate,
                  processTime: result.processTime,
                });
              }
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
              status: ReduceTaskStatus.PENDING,
              thirdTaskId: response.data.body,
              errorMsg: null,
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
