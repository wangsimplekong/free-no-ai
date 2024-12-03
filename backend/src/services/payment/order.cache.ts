import { supabase } from '../../config/database';
import { logger } from '../../utils/logger';
import { PaymentRequest } from '../../types/payment.types';
import { paymentConfig } from '../../config/payment.config';

export class OrderCache {
  private readonly prefix = paymentConfig.cache.orderPrefix;

  async cacheOrder(order: PaymentRequest & { payUrl: string; expireTime: string }): Promise<void> {
    try {
      const key = `${this.prefix}${order.orderId}`;
      const { error } = await supabase
        .from('t_order_cache')
        .upsert({
          key,
          value: order,
          expires_at: new Date(order.expireTime)
        });

      if (error) throw error;
    } catch (error) {
      logger.error('Cache order failed:', error);
      throw error;
    }
  }

  async getOrder(orderId: string): Promise<(PaymentRequest & { payUrl: string; expireTime: string }) | null> {
    try {
      const key = `${this.prefix}${orderId}`;
      const { data, error } = await supabase
        .from('t_order_cache')
        .select('value')
        .eq('key', key)
        .gt('expires_at', new Date())
        .single();

      if (error) return null;
      return data?.value as PaymentRequest & { payUrl: string; expireTime: string };
    } catch (error) {
      logger.error('Get order from cache failed:', error);
      return null;
    }
  }
}