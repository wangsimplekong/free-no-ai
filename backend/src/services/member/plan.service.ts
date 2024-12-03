import { supabase } from '../../config/database';
import { MemberPlan } from '../../types/member-plan.types';
import { logger } from '../../utils/logger';

export class MemberPlanService {
  async getAllPlans(): Promise<MemberPlan[]> {
    try {
      const { data, error } = await supabase
        .from('t_member_plan')
        .select('*')
        .eq('status', 1)
        .order('level', { ascending: true });

      if (error) {
        logger.error('Error fetching member plans:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      logger.error('Failed to fetch member plans:', error);
      throw error;
    }
  }

  async getPlanById(planId: string): Promise<MemberPlan | null> {
    try {
      const { data, error } = await supabase
        .from('t_member_plan')
        .select('*')
        .eq('id', planId)
        .eq('status', 1)
        .single();

      if (error) {
        logger.error('Error fetching member plan by id:', error);
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Failed to fetch member plan:', error);
      throw error;
    }
  }
}