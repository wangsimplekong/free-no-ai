import { createHttpClient } from '../../utils/http.util';
import { logger } from '../../utils/logger';
import { paymentConfig } from '../../config/payment.config';
import { SignatureUtil } from '../../utils/payment/signature.util';
import { OrderRepository } from '../../repositories/order/order.repository';
import { PaymentRepository } from '../../repositories/order/payment.repository';
import { supabase } from '../../config/database';
import { QuotaModel } from '../../models/quota.model';
import type {
  PaymentRequest,
  PaymentResponse,
  PaymentCallback,
  PaymentStatus,
} from '../../types/payment.types';
import { QuotaChangeType, QuotaType } from '../../types/member.types';

export class PaymentService {
  private httpClient;
  private orderRepository: OrderRepository;
  private paymentRepository: PaymentRepository;
  private quotaModel: QuotaModel;

  constructor() {
    this.httpClient = createHttpClient(paymentConfig.gateway.url);
    this.orderRepository = new OrderRepository();
    this.paymentRepository = new PaymentRepository();
    this.quotaModel = new QuotaModel();
  }

  async createPayment(params: PaymentRequest): Promise<PaymentResponse> {
    try {
      // 记录请求参数
      logger.info('Creating payment request: ' + JSON.stringify(params));

      // 1. 构造支付参数
      const payParams = {
        order_id: params.orderId,
        product_name: params.subject,
        product_desc: params.body,
        pay_amount: params.amount
      };


      // 2. 生成签名
      const sign = SignatureUtil.generate(payParams, paymentConfig.gateway.appSecret);

      logger.info('Payment parameters:'+  JSON.stringify(payParams) +"; sign:"+ sign);
      // 3. 拼接支付URL
      const queryString = new URLSearchParams({
        ...payParams,
        appid: paymentConfig.gateway.appId,
        callback: paymentConfig.gateway.notifyUrl,
        sign
      }).toString();
      
      const payUrl = `${paymentConfig.gateway.url}?${queryString}`;

      // 4. 创建支付记录
      const paymentData = {
        order_id: params.orderId,
        amount: params.amount,
        status: 1, // 处理中
        pay_type: params.payType || 1, // 默认支付类型
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      logger.info('Creating payment record with data: ' + JSON.stringify(paymentData));

      const payment = await this.paymentRepository.create(paymentData).catch(error => {
        logger.error('Payment record creation failed: ' + (error?.message || error) + 
          ', stack: ' + error?.stack + 
          ', data: ' + JSON.stringify(paymentData));
        throw new Error(`支付记录创建失败: ${error?.message || '未知错误'}`);
      });

      // 5. 构造返回结果
      const result = {
        payUrl,
        qrCode: payUrl,
        orderId: params.orderId,
        orderNo: params.orderNo,
        amount: params.amount,
        expireTime: new Date(
          Date.now() + paymentConfig.order.expireTime * 1000
        ).toISOString()
      };

      logger.info('Payment created successfully: ' + JSON.stringify(result));

      return result;
    } catch (error) {
      logger.error('Create payment failed: ' + (error?.message || error) + 
        ', stack: ' + error?.stack + 
        ', params: ' + JSON.stringify(params) + 
        ', context: PaymentService.createPayment');
      
      throw new Error(error?.message || '支付创建失败，请稍后重试');
    }
  }

  async handleCallback(params: PaymentCallback): Promise<void> {
    try {
      // 1. 验证签名时,只使用与签名生成时相同的参数
      const verifyParams = {
        order_id: params.order_id, 
        product_name: params.product_name,
        product_desc: params.product_desc,
        pay_amount: params.pay_amount 
      };
      logger.info('handleCallback verifyParams parameters:'+  JSON.stringify(verifyParams) +"; sign:"+ params.sign);

      if (!SignatureUtil.verify(verifyParams, params.sign, paymentConfig.gateway.appSecret)) {
        throw new Error('Invalid signature');
      }

      // 2. 更新支付记录
      await this.paymentRepository.update(params.order_id, {
        trade_no: params.trade_no,
        status: params.pay_status === '0' ? 2 : 3, // 2-成功，3-失败
        callback_data: params,
        updated_at: new Date().toISOString()
      });

      // 3. 如果支付成功，执行后续业务逻辑
      if (params.pay_status === '0') {
        try {
          await this.completePayment(params.order_id);
        } catch (error) {
          logger.error('Complete payment process failed: ' + (error?.message || error) + 
            ', orderId: ' + params.order_id + 
            ', context: PaymentService.handleCallback.completePayment');
          // 这里选择记录错误但不抛出，避免影响支付回调的响应
          // 可以考虑添加重试机制或通知管理员手动处理
        }
      } else {
        // 支付失败，更新订单状态-失败 
        await this.orderRepository.updateStatus(params.order_id,  3    );
      }

      logger.info('Payment callback processed: ' + 
        'orderNo: ' + params.order_id + 
        ', status: ' + params.pay_status + 
        ', tradeNo: ' + params.trade_no);
    } catch (error) {
      logger.error('Payment callback failed: ' + (error?.message || error) + 
        ', stack: ' + error?.stack + 
        ', params: ' + JSON.stringify(params) + 
        ', context: PaymentService.handleCallback');
      throw error;
    }
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
          pay_time: new Date().toISOString(),
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
      await this.quotaModel.createQuotaRecord({
        user_id: order.user_id,
        quota_type: QuotaType.DETECTION,
        change_type: QuotaChangeType.RECHARGE,
        change_amount: plan.detection_quota,
        expire_time: expireTime.toISOString(),
        created_at: new Date().toISOString()
      });

      // Update rewrite quota
      await this.quotaModel.createQuotaRecord({
        user_id: order.user_id,
        quota_type: QuotaType.REWRITE,
        change_type: QuotaChangeType.RECHARGE,
        change_amount: plan.rewrite_quota,
        expire_time: expireTime.toISOString(),
        created_at: new Date().toISOString()
      });

      logger.info('Payment completed successfully: ' + 
        'orderId: ' + orderId + 
        ', userId: ' + order.user_id + 
        ', planId: ' + plan.id);

      return { success: true };
    } catch (error) {
      logger.error('Complete payment failed: ' + error);
      throw error;
    }
  }

}