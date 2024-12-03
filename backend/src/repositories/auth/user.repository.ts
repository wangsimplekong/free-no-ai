import { User } from '../../types/database.types';
import { supabase } from '../../config/database';
import { logger } from '../../utils/logger';

export class UserRepository {
  async findByUsername(username: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('t_user')
        .select('*')
        .eq('username', username)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      logger.error('Error finding user by username:', error);
      throw error;
    }
  }

  async createUser(userData: any): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('t_user')
        .insert([userData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  async createPhoneRecord(recordData: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('t_user_phone_record')
        .insert([recordData]);

      if (error) throw error;
    } catch (error) {
      logger.error('Error creating phone record:', error);
      throw error;
    }
  }

  async createEmailRecord(recordData: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('t_user_email_record')
        .insert([recordData]);

      if (error) throw error;
    } catch (error) {
      logger.error('Error creating email record:', error);
      throw error;
    }
  }

  async createToken(tokenData: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('t_user_token')
        .insert([tokenData]);

      if (error) throw error;
    } catch (error) {
      logger.error('Error creating token record:', error);
      throw error;
    }
  }

  async createLoginLog(logData: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('t_user_login_log')
        .insert([logData]);

      if (error) throw error;
    } catch (error) {
      logger.error('Error creating login log:', error);
      throw error;
    }
  }

  async updateLastLogin(userId: string, loginIp: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('t_user')
        .update({
          last_login_at: new Date().toISOString(),
          last_login_ip: loginIp,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      logger.error('Error updating last login:', error);
      throw error;
    }
  }
}