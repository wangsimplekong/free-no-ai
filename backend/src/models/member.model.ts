import { supabase } from '../config/database';
import { Member, MemberStatus } from '../types/member.types';
import { logger } from '../utils/logger';

export class MemberModel {
  private static readonly TABLE_NAME = 't_member';

  static async findByUserId(userId: string): Promise<Member | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        logger.error('Database error in findByUserId:', {
          error,
          userId,
          errorCode: error.code,
          errorMessage: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Error in findByUserId:', {
        error,
        userId,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  static async create(member: Partial<Member>): Promise<Member> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert([{
          user_id: member.user_id,
          plan_id: member.plan_id,
          status: member.status,
          start_time: member.start_time?.toISOString(),
          expire_time: member.expire_time?.toISOString(),
          auto_renew: member.auto_renew,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .maybeSingle();

      if (error) {
        logger.error('Database error in create:', {
          error,
          member,
          errorCode: error.code,
          errorMessage: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      if (!data) {
        const error = new Error('Failed to create member record');
        logger.error('Create operation returned no data:', {
          error,
          member
        });
        throw error;
      }
      
      return data;
    } catch (error) {
      logger.error('Error in create:', {
        error,
        member,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  static async updateStatus(userId: string, status: MemberStatus): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        logger.error('Database error in updateStatus:', {
          error,
          userId,
          status,
          errorCode: error.code,
          errorMessage: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
    } catch (error) {
      logger.error('Error in updateStatus:', {
        error,
        userId,
        status,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  static async updateAutoRenew(userId: string, autoRenew: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          auto_renew: autoRenew,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        logger.error('Database error in updateAutoRenew:', {
          error,
          userId,
          autoRenew,
          errorCode: error.code,
          errorMessage: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
    } catch (error) {
      logger.error('Error in updateAutoRenew:', {
        error,
        userId,
        autoRenew,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }
}