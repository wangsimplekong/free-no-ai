import { supabase } from '../config/database';
import { UserQuota, QuotaType, QuotaRecord, QuotaChangeType } from '../types/member.types';
import { logger } from '../utils/logger';

export class QuotaModel {
  private readonly QUOTA_TABLE = 't_user_quota';
  private readonly RECORD_TABLE = 't_quota_record';

  async getUserQuotas(userId: string): Promise<UserQuota[]> {
    try {
      const { data, error } = await supabase
        .from(this.QUOTA_TABLE)
        .select('*')
        .eq('user_id', userId)

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error getting user quotas:', error);
      throw error;
    }
  }

  async upsertQuota(quota: Partial<UserQuota>): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.QUOTA_TABLE)
        .upsert({
          ...quota,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,quota_type' });

      if (error) throw error;
    } catch (error) {
      logger.error('Error upserting quota:', error);
      throw error;
    }
  }

  async createQuotaRecord(_record: Partial<QuotaRecord & { expire_time?: string, created_at?: string }>): Promise<void> {
    try {
      const { expire_time, created_at, ...record } = _record
      logger.info('Creating quota record with params:', record);

      // 1. 查询用户额度记录
      logger.info('Step 1: Querying user quota');
      const { data: quotaData, error: quotaError } = await supabase
        .from(this.QUOTA_TABLE)
        .select('*')
        .eq('user_id', record.user_id)
        .eq('quota_type', record.quota_type)
        .single();

      // 只有在不是"没有找到记录"的错误时才抛出
      if (quotaError && quotaError.code !== 'PGRST116') {
        logger.error('Error querying user quota:', quotaError);
        throw quotaError;
      }

      let currentQuota = quotaData;
      
      // 如果没有找到额度记录，创建一个基础记录
      if (!currentQuota) {
        logger.info('Step 1.1: No quota found, creating base record');
        const { data: newQuota, error: insertError } = await supabase
          .from(this.QUOTA_TABLE)
          .insert({
            user_id: record.user_id,
            quota_type: record.quota_type,
            total_quota: 0,
            used_quota: 0,
            expire_time: expire_time,
            created_at: created_at,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          logger.error('Error creating base quota:', insertError);
          throw insertError;
        }
        logger.info('Created base quota:', newQuota);
        currentQuota = newQuota;
      }

      // 2. 计算新的已使用额度和总额度
      logger.info('Step 2: Calculating new quotas');
      const currentUsed = currentQuota.used_quota || 0;
      const currentTotal = currentQuota.total_quota || 0;
      const changeAmount = record.change_amount || 0;
      
      let newUsedQuota = currentUsed;
      let newTotalQuota = currentTotal;

      if ([QuotaChangeType.RECHARGE, QuotaChangeType.REFUND].includes(record.change_type!)) {
        // 充值或退款时增加总额度
        newTotalQuota = currentTotal + changeAmount;
        logger.info('Recharge/Refund - Updating total quota:', { currentTotal, changeAmount, newTotalQuota });
      } else {
        // 消费或过期时增加已使用额度
        newUsedQuota = currentUsed + changeAmount;
        logger.info('Consume/Expire - Updating used quota:', { currentUsed, changeAmount, newUsedQuota });
      }

      // 3. 更新额度使用记录
      logger.info('Step 3: Updating quota', newTotalQuota, newUsedQuota);
      const { error: updateError } = await supabase
        .from(this.QUOTA_TABLE)
        .update({
          total_quota: newTotalQuota,
          used_quota: newUsedQuota,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', record.user_id)
        .eq('quota_type', record.quota_type)

      if (updateError) {
        logger.error('Error updating quota:', updateError);
        throw updateError;
      }
      logger.info('Quota updated successfully');

      // 4. 创建额度变更记录
      logger.info('Step 4: Creating quota record');
      const recordData = {
        ...record,
        change_amount: changeAmount,
        before_amount: currentUsed,
        after_amount: newUsedQuota,
        created_at: new Date().toISOString()
      };
      logger.info('Creating record with data:', recordData);

      const { error: recordError } = await supabase
        .from(this.RECORD_TABLE)
        .insert([recordData]);

      if (recordError) {
        logger.error('Error creating quota record:', recordError);
        throw recordError;
      }
      logger.info('Quota record created successfully');
    } catch (error) {
      logger.error('Error in createQuotaRecord:', error);
      throw error;
    }
  }
}