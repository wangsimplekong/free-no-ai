import { supabase } from '../../config/database';
import { logger } from '../../utils/logger';

export class PaymentRepository {
  async create(paymentData: any): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('t_payment_record')
        .insert([paymentData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Error creating payment record:', error);
      throw error;
    }
  }

  async findByOrderId(orderId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('t_payment_record')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      logger.error('Error finding payment record by order id:', error);
      throw error;
    }
  }

  async update(orderId: string, updateData: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('t_payment_record')
        .update(updateData)
        .eq('order_id', orderId);

      if (error) throw error;
    } catch (error) {
      logger.error('Error updating payment record:', error);
      throw error;
    }
  }
} 