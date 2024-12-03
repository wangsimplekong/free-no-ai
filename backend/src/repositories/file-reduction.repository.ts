import { supabase } from '../config/database';
import { logger } from '../utils/logger';
import {
  ReduceTaskStatus,
  ReduceListRequest,
  ReduceListResponse,
} from '../types/file-reduction.types';
import { v4 as uuidv4 } from 'uuid';

export class FileReductionRepository {
  private readonly TABLE_NAME = 't_reduce_task';

  async findReductionHistory(
    params: ReduceListRequest
  ): Promise<ReduceListResponse> {
    try {
      const { pageNum, pageSize, userId, startTime, endTime, status } = params;
      const offset = (pageNum - 1) * pageSize;

      let query = supabase
        .from(this.TABLE_NAME)
        .select('*', { count: 'exact' })
        .eq('f_user_id', userId)
        .order('f_create_time', { ascending: false });

      if (startTime) {
        query = query.gte('f_create_time', startTime);
      }
      if (endTime) {
        query = query.lte('f_create_time', endTime);
      }
      if (status !== undefined) {
        query = query.eq('f_status', status);
      }

      query = query.range(offset, offset + pageSize - 1);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      const total = count || 0;
      const pages = Math.ceil(total / pageSize);

      const list = data.map((item) => ({
        id: item.f_id,
        title: item.f_title,
        wordCount: item.f_word_count,
        createTime: item.f_create_time,
        status: item.f_status,
        detectionId: item.f_detection_id,
        detectionStatus: item.f_detection_status,
        reduceUrl: item.f_reduce_url,
        recheckUrl: item.f_recheck_url,
        reduceRate: item.f_reduce_rate,
        processTime: item.f_process_time,
        errorMsg: item.f_error_msg,
      }));

      return { total, pages, list };
    } catch (error) {
      logger.error('Failed to find reduction history:', error);
      throw error;
    }
  }

  async createReductionTask(data: {
    userId: string;
    title: string;
    wordCount: number;
    detectionId: string;
  }) {
    const testUserId = uuidv4();
    try {
      const { data: result, error } = await supabase
        .from(this.TABLE_NAME)
        .insert([
          {
            f_user_id: testUserId,
            f_title: data.title,
            f_word_count: data.wordCount,
            f_detection_id: data.detectionId,
            f_status: ReduceTaskStatus.WAITING,
            f_retry_count: 0,
            f_create_time: new Date().toISOString(),
            f_update_time: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return result;
    } catch (error) {
      logger.error(error);
      logger.error('Failed to create reduction task:', error);
      throw error;
    }
  }

  async updateTask(
    taskId: string,
    updateData: {
      status?: ReduceTaskStatus;
      errorMsg?: string;
      reduceUrl?: string;
      recheckUrl?: string;
      reduceRate?: number;
      processTime?: number;
      thirdTaskId?: string;
    }
  ) {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          ...updateData,
          f_update_time: new Date().toISOString(),
        })
        .eq('f_id', taskId);

      if (error) {
        throw error;
      }
    } catch (error) {
      logger.error('Failed to update reduction task:', error);
      throw error;
    }
  }

  async findUnfinishedTasks() {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .in('f_status', [ReduceTaskStatus.PENDING])
        .order('f_create_time', { ascending: true });

      if (error) {
        throw error;
      }
      logger.info(data);

      return data || [];
    } catch (error) {
      logger.error('Failed to find unfinished tasks:', error);
      throw error;
    }
  }

  async findByThirdTaskId(thirdTaskId: string) {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('f_third_task_id', thirdTaskId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Failed to find task by third party ID:', error);
      throw error;
    }
  }

  async incrementRetryCount(taskId: string) {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          f_retry_count: supabase.rpc('increment_retry_count', { task_id: taskId }),
          f_update_time: new Date().toISOString(),
        })
        .eq('f_id', taskId);

      if (error) {
        logger.error(error);
        throw error;
      }
    } catch (error) {
      logger.error(error);
      logger.error('Failed to increment retry count:', error);
      throw error;
    }
  }
}
