import { supabase } from '../config/database';
import { logger } from '../utils/logger';
import {
  DetectionTaskStatus,
  DetectionListRequest,
  DetectionListResponse,
} from '../types/file-detection.types';
import { v4 as uuidv4 } from 'uuid';

export class FileDetectionRepository {
  private readonly TABLE_NAME = 't_aigc_detection';

  async findDetectionHistory(
    params: DetectionListRequest
  ): Promise<DetectionListResponse> {
    try {
      const { pageNum, pageSize, userId, startTime, endTime, status } = params;
      const offset = (pageNum - 1) * pageSize;

      // Build query
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*', { count: 'exact' })
        .eq('f_user_id', userId)
        .order('f_create_time', { ascending: false });

      // Add optional filters
      if (startTime) {
        query = query.gte('f_create_time', startTime);
      }
      if (endTime) {
        query = query.lte('f_create_time', endTime);
      }
      if (status !== undefined) {
        query = query.eq('f_status', status);
      }

      // Add pagination
      query = query.range(offset, offset + pageSize - 1);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      const total = count || 0;
      const pages = Math.ceil(total / pageSize);

      // Transform data to match response format
      const list = data.map((item) => ({
        id: item.f_id,
        title: item.f_title,
        wordCount: item.f_word_count,
        createTime: item.f_create_time,
        status: item.f_status,
        similarity: item.f_similarity,
        similarityHigh: item.f_similarity_high,
        similarityMedium: item.f_similarity_medium,
        similarityLow: item.f_similarity_low,
        similarityUncheck: item.f_similarity_uncheck,
        reportUrl: item.f_report_url,
        reportTime: item.f_report_time,
        sourceFileUrl: item.f_source_file_url,
        sourceFileType: item.f_source_file_type,
        errorMsg: item.f_error_msg,
      }));

      return { total, pages, list };
    } catch (error) {
      logger.error('Failed to find detection history');
      logger.error({
        error,
        params,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  async createDetectionTask(data: {
    userId?: string;
    title: string;
    wordCount: number;
    sourceFileUrl?: string;
    sourceFileType?: string;
  }) {
    try {
      // Generate random UUID for testing purposes
      const testUserId = uuidv4();

      logger.info('Creating detection task', {
        context: 'FileDetectionRepository.createDetectionTask',
        userId: testUserId,
        title: data.title,
        wordCount: data.wordCount,
        fileType: data.sourceFileType,
        timestamp: new Date().toISOString(),
      });

      const { data: result, error } = await supabase
        .from(this.TABLE_NAME)
        .insert([
          {
            f_user_id: testUserId,
            f_title: data.title,
            f_word_count: data.wordCount,
            f_status: DetectionTaskStatus.PENDING,
            f_source_file_url: data.sourceFileUrl,
            f_source_file_type: data.sourceFileType,
            f_retry_count: 0,
            f_create_time: new Date().toISOString(),
            f_update_time: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        logger.error('Database error in createDetectionTask', {
          context: 'FileDetectionRepository.createDetectionTask',
          error: {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          },
          data,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }

      logger.info('Detection task created successfully', {
        context: 'FileDetectionRepository.createDetectionTask',
        taskId: result.f_id,
        userId: testUserId,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      logger.error('Failed to create detection task', {
        context: 'FileDetectionRepository.createDetectionTask',
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
        data,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  async findByThirdTaskId(thirdTaskId: string) {
    try {
      logger.info('Finding task by third party ID', {
        context: 'FileDetectionRepository.findByThirdTaskId',
        thirdTaskId,
        timestamp: new Date().toISOString(),
      });

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('f_third_task_id', thirdTaskId)
        .single();

      if (error && error.code !== 'PGRST116') {
        logger.error('Database error in findByThirdTaskId', {
          context: 'FileDetectionRepository.findByThirdTaskId',
          error: {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          },
          thirdTaskId,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }

      logger.info('Task lookup completed', {
        context: 'FileDetectionRepository.findByThirdTaskId',
        thirdTaskId,
        found: !!data,
        timestamp: new Date().toISOString(),
      });

      return data;
    } catch (error) {
      logger.error('Failed to find task by third party ID', {
        context: 'FileDetectionRepository.findByThirdTaskId',
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
        thirdTaskId,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  async updateTask(
    taskId: string,
    updateData: {
      f_status?: DetectionTaskStatus;
      f_error_msg?: string;
      f_similarity?: number;
      f_report_url?: string;
      f_third_task_id?: string;
    }
  ) {
    try {
      logger.info('Updating detection task');
      logger.info({
        context: 'FileDetectionRepository.updateTask',
        taskId,
        updateFields: Object.keys(updateData),
        updateData: updateData,
        timestamp: new Date().toISOString(),
      });

      const dbUpdateData: Record<string, any> = {};

      // Map the input fields to database column names
      if (updateData.f_status !== undefined) {
        dbUpdateData.f_status = updateData.f_status;
      }
      if (updateData.f_error_msg !== undefined) {
        dbUpdateData.f_error_msg = updateData.f_error_msg;
      }
      if (updateData.f_similarity !== undefined) {
        dbUpdateData.f_similarity = updateData.f_similarity;
      }
      if (updateData.f_report_url !== undefined) {
        dbUpdateData.f_report_url = updateData.f_report_url;
      }
      if (updateData.f_third_task_id !== undefined) {
        dbUpdateData.f_third_task_id = updateData.f_third_task_id;
      }

      // Always update the update time
      dbUpdateData.f_update_time = new Date().toISOString();
      logger.info('dbUpdateData:');
      logger.info(dbUpdateData);

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update(dbUpdateData)
        .eq('f_id', taskId);

      if (error) {
        logger.error('Database error in updateTask', {
          context: 'FileDetectionRepository.updateTask',
          error: {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          },
          taskId,
          updateData: dbUpdateData,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }

      logger.info('Task updated successfully', {
        context: 'FileDetectionRepository.updateTask',
        taskId,
        status: updateData.f_status,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to update task', {
        context: 'FileDetectionRepository.updateTask',
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
        taskId,
        updateData,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  async findUnfinishedTasks() {
    try {
      logger.info('Finding unfinished tasks', {
        context: 'FileDetectionRepository.findUnfinishedTasks',
        timestamp: new Date().toISOString(),
      });

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .in('f_status', [
          DetectionTaskStatus.SUBMITTED,
          DetectionTaskStatus.PROCESSING,
        ])
        .order('f_create_time', { ascending: true });

      if (error) {
        logger.error('Database error in findUnfinishedTasks', {
          context: 'FileDetectionRepository.findUnfinishedTasks',
          error: {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          },
          timestamp: new Date().toISOString(),
        });
        throw error;
      }

      logger.info('Unfinished tasks retrieved', {
        context: 'FileDetectionRepository.findUnfinishedTasks',
        count: data?.length || 0,
        timestamp: new Date().toISOString(),
      });

      return data || [];
    } catch (error) {
      logger.error('Failed to find unfinished tasks', {
        context: 'FileDetectionRepository.findUnfinishedTasks',
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  async deleteExpiredTasks(threshold: Date) {
    try {
      logger.info('Deleting expired tasks', {
        context: 'FileDetectionRepository.deleteExpiredTasks',
        threshold: threshold.toISOString(),
        timestamp: new Date().toISOString(),
      });

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .lt('f_create_time', threshold.toISOString())
        .in('f_status', [
          DetectionTaskStatus.COMPLETED,
          DetectionTaskStatus.FAILED,
        ]);

      if (error) {
        logger.error('Database error in deleteExpiredTasks', {
          context: 'FileDetectionRepository.deleteExpiredTasks',
          error: {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          },
          threshold: threshold.toISOString(),
          timestamp: new Date().toISOString(),
        });
        throw error;
      }

      logger.info('Expired tasks deleted', {
        context: 'FileDetectionRepository.deleteExpiredTasks',
        deletedCount: data?.length || 0,
        threshold: threshold.toISOString(),
        timestamp: new Date().toISOString(),
      });

      return data?.length || 0;
    } catch (error) {
      logger.error('Failed to delete expired tasks', {
        context: 'FileDetectionRepository.deleteExpiredTasks',
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
        threshold: threshold.toISOString(),
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  async findRetryableTasks(maxRetries: number) {
    try {
      logger.info('Finding retryable tasks', {
        context: 'FileDetectionRepository.findRetryableTasks',
        maxRetries,
        timestamp: new Date().toISOString(),
      });

      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('f_status', DetectionTaskStatus.FAILED)
        .lt('f_retry_count', maxRetries)
        .order('f_create_time', { ascending: true });

      if (error) {
        logger.error('Database error in findRetryableTasks', {
          context: 'FileDetectionRepository.findRetryableTasks',
          error: {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          },
          maxRetries,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }

      logger.info('Retryable tasks found', {
        context: 'FileDetectionRepository.findRetryableTasks',
        count: data?.length || 0,
        maxRetries,
        timestamp: new Date().toISOString(),
      });

      return data || [];
    } catch (error) {
      logger.error('Failed to find retryable tasks', {
        context: 'FileDetectionRepository.findRetryableTasks',
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
        maxRetries,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }

  async incrementRetryCount(taskId: string) {
    try {
      logger.info('Incrementing retry count', {
        context: 'FileDetectionRepository.incrementRetryCount',
        taskId,
        timestamp: new Date().toISOString(),
      });

      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          f_retry_count: supabase.raw('f_retry_count + 1'),
          f_update_time: new Date().toISOString(),
        })
        .eq('f_id', taskId);

      if (error) {
        logger.error('Database error in incrementRetryCount', {
          context: 'FileDetectionRepository.incrementRetryCount',
          error: {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          },
          taskId,
          timestamp: new Date().toISOString(),
        });
        throw error;
      }

      logger.info('Retry count incremented', {
        context: 'FileDetectionRepository.incrementRetryCount',
        taskId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to increment retry count', {
        context: 'FileDetectionRepository.incrementRetryCount',
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
                stack: error.stack,
              }
            : error,
        taskId,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }
}
