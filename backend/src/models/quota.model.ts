import { supabase } from '../config/database';
import { UserQuota, QuotaType, QuotaRecord } from '../types/member.types';
import { logger } from '../utils/logger';

export class QuotaModel {
  private static readonly QUOTA_TABLE = 't_user_quota';
  private static readonly RECORD_TABLE = 't_quota_record';

  static async findUserQuota(userId: string, quotaType: QuotaType): Promise<UserQuota | null> {
    try {
      const { data, error } = await supabase
        .from(this.QUOTA_TABLE)
        .select('*')
        .eq('f_user_id', userId)
        .eq('f_quota_type', quotaType)
        .eq('f_is_deleted', false)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error finding user quota:', error);
      throw error;
    }
  }

  static async updateQuota(
    userId: string,
    quotaType: QuotaType,
    usedQuota: number
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.QUOTA_TABLE)
        .update({
          f_used_quota: usedQuota,
          f_updated_at: new Date().toISOString()
        })
        .eq('f_user_id', userId)
        .eq('f_quota_type', quotaType)
        .eq('f_is_deleted', false);

      if (error) throw error;
    } catch (error) {
      logger.error('Error updating quota:', error);
      throw error;
    }
  }

  static async createQuotaRecord(record: Partial<QuotaRecord>): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.RECORD_TABLE)
        .insert([{
          ...record,
          f_created_at: new Date().toISOString()
        }]);

      if (error) throw error;
    } catch (error) {
      logger.error('Error creating quota record:', error);
      throw error;
    }
  }

  static async getUserQuotas(userId: string): Promise<UserQuota[]> {
    try {
      const { data, error } = await supabase
        .from(this.QUOTA_TABLE)
        .select('*')
        .eq('f_user_id', userId)
        .eq('f_is_deleted', false);

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error getting user quotas:', error);
      throw error;
    }
  }
}