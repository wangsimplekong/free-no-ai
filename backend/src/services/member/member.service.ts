import { MemberModel } from '../../models/member.model';
import { QuotaModel } from '../../models/quota.model';
import { UserModel } from '../../models/user.model';
import { MemberStatus, QuotaType, QuotaChangeType } from '../../types/member.types';
import { SubscribeDTO, SubscribeResponseDTO } from '../../dto/member/subscribe.dto';
import { QuotaResponseDTO, QuotaConsumeDTO, QuotaConsumeResponseDTO } from '../../dto/member/quota.dto';
import { PaymentService } from '../payment/payment.service';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../config/database';

export class MemberService {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  async subscribe(userId: string, dto: SubscribeDTO): Promise<SubscribeResponseDTO> {
    try {
      // Get plan details first
      const { data: plan, error: planError } = await supabase
        .from('t_member_plan')
        .select('*')
        .eq('id', dto.plan_id)
        .single();

      if (planError || !plan) {
        logger.error('Failed to fetch plan:', { planError, planId: dto.plan_id });
        throw new Error('Invalid plan selected');
      }

      // Verify user exists
      const { data: user, error: userError } = await supabase
        .from('t_user')
        .select('id')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        logger.error('User not found:', { userError, userId });
        throw new Error('User not found');
      }

      // Check existing membership
      const { data: existingMember, error: memberError } = await supabase
        .from('t_member')
        .select('*')
        .eq('user_id', userId)
        .eq('status', MemberStatus.NORMAL)
        .maybeSingle();

      if (memberError) {
        logger.error('Error checking existing membership:', { memberError, userId });
        throw memberError;
      }

      if (existingMember) {
        logger.warn('User already has active membership', {
          userId,
          membershipId: existingMember.id
        });
        throw new Error('User already has an active membership');
      }

      // Generate order details
      const orderId = uuidv4();
      const orderNo = `MEM${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const amount = plan.price * dto.duration;

      // Create payment request
      const paymentResult = await this.paymentService.createPayment({
        orderNo,
        orderId,
        subject: `${plan.name} Subscription`,
        body: `${plan.name} subscription for ${dto.duration} months`,
        amount,
        userId
      });

      // Calculate membership period
      const startTime = new Date();
      const expireTime = new Date();
      expireTime.setMonth(expireTime.getMonth() + dto.duration);

      // Create member record
      const { data: newMember, error: createError } = await supabase
        .from('t_member')
        .insert([{
          user_id: userId,
          plan_id: dto.plan_id,
          status: MemberStatus.NORMAL,
          start_time: startTime.toISOString(),
          expire_time: expireTime.toISOString(),
          auto_renew: dto.auto_renew
        }])
        .select()
        .single();

      if (createError || !newMember) {
        logger.error('Failed to create member:', { createError });
        throw new Error('Failed to create membership');
      }

      // Initialize quotas
      const quotaPromises = [
        // Detection quota
        supabase.from('t_user_quota').upsert({
          user_id: userId,
          quota_type: QuotaType.DETECTION,
          total_quota: plan.detection_quota * dto.duration,
          used_quota: 0,
          expire_time: expireTime.toISOString()
        }, { onConflict: 'user_id,quota_type' }),

        // Rewrite quota
        supabase.from('t_user_quota').upsert({
          user_id: userId,
          quota_type: QuotaType.REWRITE,
          total_quota: plan.rewrite_quota * dto.duration,
          used_quota: 0,
          expire_time: expireTime.toISOString()
        }, { onConflict: 'user_id,quota_type' }),

        // Quota records
        supabase.from('t_quota_record').insert([
          {
            user_id: userId,
            quota_type: QuotaType.DETECTION,
            change_type: QuotaChangeType.RECHARGE,
            change_amount: plan.detection_quota * dto.duration,
            before_amount: 0,
            after_amount: plan.detection_quota * dto.duration,
            order_id: orderId,
            remark: `Initial detection quota for plan ${plan.name}`
          },
          {
            user_id: userId,
            quota_type: QuotaType.REWRITE,
            change_type: QuotaChangeType.RECHARGE,
            change_amount: plan.rewrite_quota * dto.duration,
            before_amount: 0,
            after_amount: plan.rewrite_quota * dto.duration,
            order_id: orderId,
            remark: `Initial rewrite quota for plan ${plan.name}`
          }
        ])
      ];

      const results = await Promise.all(quotaPromises);
      const errors = results.filter(r => r.error).map(r => r.error);

      if (errors.length > 0) {
        logger.error('Failed to initialize quotas:', { errors });
        throw new Error('Failed to initialize quotas');
      }

      logger.info('Subscription process completed', {
        userId,
        orderId,
        amount,
        memberId: newMember.id,
        startTime,
        expireTime,
        detectionQuota: plan.detection_quota * dto.duration,
        rewriteQuota: plan.rewrite_quota * dto.duration
      });

      return {
        order_id: orderId,
        amount,
        pay_url: paymentResult.payUrl
      };
    } catch (error) {
      logger.error('Subscription process failed:', {
        error,
        userId,
        planId: dto.plan_id
      });
      throw error;
    }
  }

  // ... rest of the service methods remain unchanged
}