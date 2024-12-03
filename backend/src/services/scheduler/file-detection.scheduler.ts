import { logger } from '../../utils/logger';
import { createHttpClient } from '../../utils/http.util';
import { aigcFileConfig } from '../../config/aigc-file.config';
import { FileDetectionRepository } from '../../repositories/file-detection.repository';
import { DetectionTaskStatus } from '../../types/file-detection.types';

export class FileDetectionScheduler {
  private httpClient;
  private detectionRepo: FileDetectionRepository;
  private readonly BATCH_SIZE = 50;
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000;

  constructor() {
    this.httpClient = createHttpClient(
      aigcFileConfig.apiUrl,
      aigcFileConfig.timeout
    );
    this.detectionRepo = new FileDetectionRepository();
  }

  async syncDetectionStatus(): Promise<void> {
    try {
      logger.info('Starting detection status sync', {
        timestamp: new Date().toISOString(),
      });

      // Get unfinished tasks
      const unfinishedTasks = await this.detectionRepo.findUnfinishedTasks();

      logger.info(unfinishedTasks);
      if (unfinishedTasks.length === 0) {
        return;
      }

      // Process tasks in batches
      for (let i = 0; i < unfinishedTasks.length; i += this.BATCH_SIZE) {
        const batch = unfinishedTasks.slice(i, i + this.BATCH_SIZE);
        const taskIds = batch.map((task) => task.f_third_task_id);

        try {
          const results = await this.queryDetectionResults(taskIds);
          await this.updateTaskStatuses(results);
        } catch (error) {
          logger.error('Failed to process batch', {
            error,
            taskIds,
            timestamp: new Date().toISOString(),
          });
        }
      }

      logger.info('Detection status sync completed', {
        processedTasks: unfinishedTasks.length,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Detection status sync failed', {
        error,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private async queryDetectionResults(taskIds: string[]): Promise<any[]> {
    try {
      const response = await this.httpClient.post(
        `/external/aigc-task/query?key=${aigcFileConfig.apiKey}`,
        {
          key: aigcFileConfig.platformKey,
          taskIds,
        },
        {
          headers: { key: aigcFileConfig.apiKey },
        }
      );

      if (response.data.status !== '200') {
        throw new Error(`API error: ${response.data.message}`);
      }

      return response.data.body;
    } catch (error) {
      logger.error('Failed to query detection results', {
        error,
        taskIds,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  private async updateTaskStatuses(results: any[]): Promise<void> {
    for (const result of results) {
      try {
        const updateData = {
          f_status: this.mapTaskStatus(result.state),
          f_similarity: result.similarity,
          f_similarity_high: result.similarityHigh,
          f_similarity_medium: result.similarityMedium,
          f_similarity_low: result.similarityLow,
          f_similarity_uncheck: result.similarityUncheck,
          f_report_url: result.zipurl,
          f_report_time: result.reportTime,
          f_update_time: new Date(),
        };

        await this.detectionRepo.updateTask(result.taskId, updateData);

        logger.info('Task status updated', {
          taskId: result.taskId,
          status: updateData.f_status,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        logger.error('Failed to update task status', {
          error,
          taskId: result.taskId,
          timestamp: new Date().toISOString(),
        });
      }
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

  async cleanupExpiredTasks(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deletedCount = await this.detectionRepo.deleteExpiredTasks(
        thirtyDaysAgo
      );

      logger.info('Expired tasks cleanup completed', {
        deletedCount,
        threshold: thirtyDaysAgo.toISOString(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to cleanup expired tasks', {
        error,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async retryFailedTasks(): Promise<void> {
    try {
      const failedTasks = await this.detectionRepo.findRetryableTasks(
        this.MAX_RETRIES
      );

      for (const task of failedTasks) {
        try {
          await this.detectionRepo.incrementRetryCount(task.f_id);
          // Re-submit the task
          // Implementation depends on your task submission logic

          logger.info('Failed task retried', {
            taskId: task.f_id,
            retryCount: task.f_retry_count + 1,
            timestamp: new Date().toISOString(),
          });
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
