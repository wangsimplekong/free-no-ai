import { supabase } from '../config/database';
import { logger } from '../utils/logger';

export enum VerifyType {
  LOGIN = 1,
  REGISTER = 2,
  RESET_PASSWORD = 3,
  BIND_PHONE = 4,
  CHANGE_PHONE = 5
}

export interface PhoneVerification {
  id: number;
  phone: string;
  code: string;
  verify_type: VerifyType;
  verify_count: number;
  expires_at: Date;
  verified_at?: Date;
  created_at: Date;
}

export const PhoneVerificationModel = {
  async findById(id: number): Promise<PhoneVerification | null> {
    const { data, error } = await supabase
      .from('t_phone_verification')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Error finding phone verification:', error);
      return null;
    }

    return data;
  },

  async create(verification: Omit<PhoneVerification, 'id' | 'created_at'>): Promise<PhoneVerification | null> {
    const { data, error } = await supabase
      .from('t_phone_verification')
      .insert([verification])
      .select()
      .single();

    if (error) {
      logger.error('Error creating phone verification:', error);
      return null;
    }

    return data;
  },

  async update(id: number, updates: Partial<PhoneVerification>): Promise<boolean> {
    const { error } = await supabase
      .from('t_phone_verification')
      .update(updates)
      .eq('id', id);

    if (error) {
      logger.error('Error updating phone verification:', error);
      return false;
    }

    return true;
  },

  async findActiveByPhone(phone: string, verifyType: VerifyType): Promise<PhoneVerification | null> {
    const { data, error } = await supabase
      .from('t_phone_verification')
      .select('*')
      .eq('phone', phone)
      .eq('verify_type', verifyType)
      .gt('expires_at', new Date().toISOString())
      .is('verified_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      logger.error('Error finding active phone verification:', error);
      return null;
    }

    return data;
  }
};

export default PhoneVerificationModel;