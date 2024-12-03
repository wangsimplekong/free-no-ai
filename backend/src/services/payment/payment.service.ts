import { createHttpClient } from '../../utils/http.util';
import { logger } from '../../utils/logger';
import { paymentConfig } from '../../config/payment.config';
import { SignatureUtil } from '../../utils/payment/signature.util';
import { PaymentCache } from './payment.cache';
import { OrderCache } from './order.cache';
import { supabase } from '../../config/database';
import type {
  PaymentRequest,
  PaymentResponse,
  PaymentCallback,
  PaymentResult,
  PaymentStatus,
} from '../../types/payment.types';

export class PaymentService {
  private httpClient;
  private paymentCache = new PaymentCache();
  private orderCache = new OrderCache();

  constructor() {
    this.httpClient = createHttpClient(paymentConfig.gateway.url);
  }

  async completePayment(orderId: string): Promise<{ success: boolean }> {
    try {
      // Get order details
      const { data: order, error: orderError } = await supabase
        .from('t_order')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        throw new Error('Order not found');
      }

      if (order.status === 2) {
        throw new Error('Order already paid');
      }

      // Get plan details
      const { data: plan, error: planError } = await supabase
        .from('t_member_plan')
        .select('*')
        .eq('id', order.plan_id)
        .single();

      if (planError || !plan) {
        throw new Error('Plan not found');
      }

      // Calculate membership period
      const startTime = new Date();
      const expireTime = new Date();
      expireTime.setMonth(expireTime.getMonth() + (plan.period_type === 1 ? 1 : 12));

      // Start transaction
      const { error: updateOrderError } = await supabase
        .from('t_order')
        .update({
          status: 2,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateOrderError) {
        throw new Error('Failed to update order status');
      }

      // Create or update member record
      const { error: memberError } = await supabase
        .from('t_member')
        .upsert({
          user_id: order.user_id,
          plan_id: plan.id,
          status: 1,
          start_time: startTime.toISOString(),
          expire_time: expireTime.toISOString(),
          auto_renew: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (memberError) {
        throw new Error('Failed to update membership');
      }

      // Update detection quota
      const { error: detectionQuotaError } = await supabase
        .from('t_user_quota')
        .upsert({
          user_id: order.user_id,
          quota_type: 1,
          total_quota: plan.detection_quota,
          used_quota: 0,
          expire_time: expireTime.toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (detectionQuotaError) {
        throw new Error('Failed to update detection quota');
      }

      // Update rewrite quota
      const { error: rewriteQuotaError } = await supabase
        .from('t_user_quota')
        .upsert({
          user_id: order.user_id,
          quota_type: 2,
          total_quota: plan.rewrite_quota,
          used_quota: 0,
          expire_time: expireTime.toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (rewriteQuotaError) {
        throw new Error('Failed to update rewrite quota');
      }

      logger.info('Payment completed successfully', {
        orderId,
        userId: order.user_id,
        planId: plan.id
      });

      return { success: true };
    } catch (error) {
      logger.error('Complete payment failed:', error);
      throw error;
    }
  }

  async createPayment(params: PaymentRequest): Promise<PaymentResponse> {
    try {
      logger.info('Creating payment request', {
        orderId: params.orderId,
        amount: params.amount,
        userId: params.userId,
      });

      const payParams = {
        order_id: params.orderNo,
        appid: paymentConfig.gateway.appId,
        product_name: params.subject,
        product_desc: params.body,
        pay_amount: params.amount,
        callback: paymentConfig.gateway.notifyUrl,
      };

      const sign = SignatureUtil.generate(
        payParams,
        paymentConfig.gateway.appSecret
      );

      const response = await this.httpClient.post(paymentConfig.gateway.url, {
        ...payParams,
        sign,
      });

      if (!response.data.code_url) {
        logger.error('Failed to get payment URL', { response });
        throw new Error('支付链接生成失败');
      }

      const result = {
        payUrl: response.data.code_url,
        qrCode: response.data.code_url,
        orderId: params.orderId,
        orderNo: params.orderNo,
        amount: params.amount,
        expireTime: new Date(
          Date.now() + paymentConfig.order.expireTime * 1000
        ).toISOString(),
      };

      await this.orderCache.cacheOrder({
        ...params,
        payUrl: result.payUrl,
        expireTime: result.expireTime,
      });

      logger.info('Payment request created successfully', {
        orderId: params.orderId,
        payUrl: result.payUrl,
      });

      return result;
    } catch (error) {
      logger.error('Create payment failed:', error);
      throw error;
    }
  }

  async handleCallback(params: PaymentCallback): Promise<PaymentResult> {
    try {
      logger.info('Received payment callback', {
        orderId: params.order_id,
        status: params.trade_status,
      });

      const isValid = SignatureUtil.verify(
        params,
        params.sign,
        paymentConfig.gateway.appSecret
      );

      if (!isValid) {
        logger.error('Invalid payment callback signature', { params });
        throw new Error('无效的支付回调签名');
      }

      const result = {
        success: params.trade_status === 'SUCCESS',
        orderId: params.order_id,
        tradeNo: params.trade_no,
        errorMessage:
          params.trade_status === 'SUCCESS' ? undefined : '支付失败',
      };

      await this.paymentCache.cachePaymentResult(params.order_id, result);

      logger.info('Payment callback processed', {
        orderId: params.order_id,
        success: result.success,
      });

      return result;
    } catch (error) {
      logger.error('Handle payment callback failed:', error);
      throw error;
    }
  }

  async getPaymentStatus(orderNo: string): Promise<PaymentStatus> {
    try {
      const cachedResult = await this.paymentCache.getPaymentResult(orderNo);
      if (cachedResult) {
        return {
          status: cachedResult.success ? 'SUCCESS' : 'FAILED',
          orderNo,
          message: cachedResult.errorMessage,
        };
      }

      const order = await this.orderCache.getOrder(orderNo);
      if (!order) {
        throw new Error('订单不存在');
      }

      if (new Date(order.expireTime) < new Date()) {
        return {
          status: 'EXPIRED',
          orderNo,
          message: '支付链接已过期',
        };
      }

      return {
        status: 'PENDING',
        orderNo,
      };
    } catch (error) {
      logger.error('Get payment status failed:', error);
      throw error;
    }
  }

  async refreshPaymentUrl(orderId: string): Promise<PaymentResponse> {
    try {
      const order = await this.orderCache.getOrder(orderId);
      if (!order) {
        throw new Error('订单不存在');
      }

      return await this.createPayment(order);
    } catch (error) {
      logger.error('Refresh payment URL failed:', error);
      throw error;
    }
  }
}