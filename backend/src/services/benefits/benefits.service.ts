import { supabase } from '../../config/database';
import { UserBenefits } from '../../types/benefits.types';
import { logger } from '../../utils/logger';
import { QuotaModel } from '../../models/quota.model';

export class BenefitsService {
  private quotaModel: QuotaModel;

  constructor() {
    this.quotaModel = new QuotaModel();
  }

  async getUserBenefits(userId: string): Promise<UserBenefits | null> {
    try {
      // Get current membership info
      const { data: memberData, error: memberError } = await supabase
        .from('t_member')
        .select(`
          status,
          plan_id,
          expire_time,
          created_at,
          t_member_plan (
            name,
            level
          )
        `)
        .eq('user_id', userId)
        .eq('status', 1)
        .single();

      if (memberError && memberError.code !== 'PGRST116') {
        throw new Error('Failed to fetch membership data');
      }

      // If no membership data found, return null
      if (!memberData) {
        return null;
      }

      // Get quota information
      const quotaData = await this.quotaModel.getUserQuotas(userId);

      // Process detection quota
      const detectionQuota = quotaData?.find(q => q.quota_type === 1) || {
        total_quota: 0,
        used_quota: 0,
        expire_time: new Date().toISOString()
      };

      // Process rewrite quota
      const rewriteQuota = quotaData?.find(q => q.quota_type === 2) || {
        total_quota: 0,
        used_quota: 0,
        expire_time: new Date().toISOString()
      };

      return {
        membership: {
          planId: memberData?.plan_id,
          planName: memberData?.t_member_plan?.name || '未开通会员',
          level: memberData?.t_member_plan?.level || 0,
          createdTime: memberData?.created_at,
          expireTime: memberData?.expire_time || new Date().toISOString(),
          status: memberData?.status || 0
        },
        quotas: {
          detection: {
            total: detectionQuota.total_quota,
            used: detectionQuota.used_quota,
            remaining: detectionQuota.total_quota - detectionQuota.used_quota,
            expireTime: detectionQuota.expire_time
          },
          rewrite: {
            total: rewriteQuota.total_quota,
            used: rewriteQuota.used_quota,
            remaining: rewriteQuota.total_quota - rewriteQuota.used_quota,
            expireTime: rewriteQuota.expire_time
          }
        }
      };
    } catch (error) {
      logger.error('Failed to get user benefits:', error);
      throw error;
    }
  }
}