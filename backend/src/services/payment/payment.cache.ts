import { supabase } from '../../config/database';
import { logger } from '../../utils/logger';
import { PaymentResult } from '../../types/payment.types';
import { paymentConfig } from '../../config/payment.config';

export class PaymentCache {
  private readonly prefix = paymentConfig.cache.paymentPrefix;

  async cachePaymentResult(orderId: string, result: PaymentResult): Promise<void> {
    try {
      const key = `${this.prefix}${orderId}`;
      const { error } = await supabase
        .from('t_payment_cache')
        .upsert({
          key,
          value: result,
          expires_at: new Date(Date.now() + paymentConfig.cache.expireTime * 1000)
        });

      if (error) throw error;
    } catch (error) {
      logger.error('Cache payment result failed:', error);
      throw error;
    }
  }

  async getPaymentResult(orderId: string): Promise<PaymentResult | null> {
    try {
      const key = `${this.prefix}${orderId}`;
      const { data, error } = await supabase
        .from('t_payment_cache')
        .select('value')
        .eq('key', key)
        .gt('expires_at', new Date())
        .single();

      if (error) return null;
      return data?.value as PaymentResult;
    } catch (error) {
      logger.error('Get payment result from cache failed:', error);
      return null;
    }
  }
}