import cron from 'node-cron';
import { logger } from '../../utils/logger';
import { FileDetectionScheduler } from './file-detection.scheduler';
import { FileReductionScheduler } from './file-reduction.scheduler';

export class SchedulerService {
  private fileDetectionScheduler: FileDetectionScheduler;
  private fileReductionScheduler: FileReductionScheduler;

  constructor() {
    this.fileDetectionScheduler = new FileDetectionScheduler();
    this.fileReductionScheduler = new FileReductionScheduler();
  }

  initialize(): void {
    logger.info('Initializing scheduler service', {
      timestamp: new Date().toISOString()
    });

    // // Sync detection status every 30 seconds
    // cron.schedule('*/30 * * * * *', async () => {
    //   try {
    //     await this.fileDetectionScheduler.syncDetectionStatus();
    //   } catch (error) {
    //     logger.error('Failed to run detection status sync job', {
    //       error,
    //       timestamp: new Date().toISOString()
    //     });
    //   }
    // });

    // // Sync reduction status every 30 seconds
    // cron.schedule('*/30 * * * * *', async () => {
    //   try {
    //     await this.fileReductionScheduler.syncReductionStatus();
    //   } catch (error) {
    //     logger.error('Failed to run reduction status sync job', {
    //       error,
    //       timestamp: new Date().toISOString()
    //     });
    //   }
    // });

    // // Clean up expired tasks every day at 00:00
    // cron.schedule('0 0 * * *', async () => {
    //   try {
    //     await this.fileDetectionScheduler.cleanupExpiredTasks();
    //   } catch (error) {
    //     logger.error('Failed to run cleanup job', {
    //       error,
    //       timestamp: new Date().toISOString()
    //     });
    //   }
    // });

    // Retry failed tasks every minute
    // cron.schedule('* * * * *', async () => {
    //   try {
    //     // await this.fileDetectionScheduler.retryFailedTasks();
    //     await this.fileReductionScheduler.retryFailedTasks();
    //   } catch (error) {
    //     logger.error('Failed to run retry job', {
    //       error,
    //       timestamp: new Date().toISOString()
    //     });
    //   }
    // });

    logger.info('Scheduler service initialized successfully', {
      timestamp: new Date().toISOString()
    });
  }

  shutdown(): void {
    logger.info('Shutting down scheduler service', {
      timestamp: new Date().toISOString()
    });
    
    // Destroy all scheduled tasks
    cron.getTasks().forEach(task => task.stop());
  }
}