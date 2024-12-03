import { supabase } from '../../config/database';
import { UserBenefits } from '../../types/benefits.types';
import { logger } from '../../utils/logger';

export class BenefitsService {
  async getUserBenefits(userId: string): Promise<UserBenefits> {
    try {
      // Get current membership info
      const { data: memberData, error: memberError } = await supabase
        .from('t_member')
        .select(`
          status,
          expire_time,
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

      // Get quota information
      const { data: quotaData, error: quotaError } = await supabase
        .from('t_user_quota')
        .select('*')
        .eq('user_id', userId)
        .in('quota_type', [1, 2]); // 1: detection, 2: rewrite

      if (quotaError) {
        throw new Error('Failed to fetch quota data');
      }

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
          planName: memberData?.t_member_plan?.name || '未开通会员',
          level: memberData?.t_member_plan?.level || 0,
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