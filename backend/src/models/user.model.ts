import { User } from '../types/database.types';
import { supabase } from '../config/database';

export const UserModel = {
  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('t_user')
      .select('*')
      .eq('f_id', id)
      .eq('f_is_deleted', false)
      .single();

    if (error) throw error;
    return data;
  },

  async findByPhone(phone: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('t_user')
      .select('*')
      .eq('f_phone', phone)
      .eq('f_is_deleted', false)
      .single();

    if (error) throw error;
    return data;
  },

  async create(data: Partial<User>): Promise<User> {
    const { data: newUser, error } = await supabase
      .from('t_user')
      .insert([{
        ...data,
        f_create_time: new Date().toISOString(),
        f_update_time: new Date().toISOString(),
        f_is_deleted: false
      }])
      .select()
      .single();

    if (error) throw error;
    return newUser;
  },

  async updateLastLogin(id: string): Promise<void> {
    const { error } = await supabase
      .from('t_user')
      .update({
        f_last_login_time: new Date().toISOString(),
        f_update_time: new Date().toISOString()
      })
      .eq('f_id', id)
      .eq('f_is_deleted', false);

    if (error) throw error;
  }
};