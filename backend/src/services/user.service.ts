import { User } from '../types/database.types';
import { BaseService } from './base.service';
import { supabase } from '../config/database';
import { logger } from '../utils/logger';

export class UserService extends BaseService<User> {
  constructor() {
    super('t_user');
  }

  async getByPhone(phone: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('f_phone', phone)
        .eq('f_is_deleted', false)
        .single();

      if (error) throw error;
      return data as User;
    } catch (error) {
      logger.error('Error fetching user by phone:', error);
      throw error;
    }
  }

  async updateLastLogin(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .update({
          f_last_login_time: new Date().toISOString(),
          f_update_time: new Date().toISOString(),
        })
        .eq('f_id', userId)
        .eq('f_is_deleted', false);

      if (error) throw error;
    } catch (error) {
      logger.error('Error updating last login:', error);
      throw error;
    }
  }
}