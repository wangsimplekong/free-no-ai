import { v4 as uuidv4 } from 'uuid';
import { OrderRepository } from '../../repositories/order/order.repository';
import { MemberPlanService } from '../../services/member/plan.service';
import { PaymentService } from '../../services/payment/payment.service';
import { CreateOrderDTO, OrderResponse, OrderStatus } from '../../types/order.types';
import { logger } from '../../utils/logger';
import { paymentConfig } from '../../config/payment.config';
import { BenefitsService } from '../../services/benefits/benefits.service';

export class OrderService {
  private benefitsService: BenefitsService;

  constructor(
    private orderRepository: OrderRepository,
    private memberPlanService: MemberPlanService,
    private paymentService: PaymentService
  ) {
    this.benefitsService = new BenefitsService();
    this.orderRepository = new OrderRepository();
    this.paymentService = new PaymentService();
  }

  private calculateUpgradePrice(currentPlan: any, targetPlan: any): number {
    if (!currentPlan) return targetPlan.price;

    // Calculate used days since plan creation
    const now = new Date();
    const startDate = new Date(currentPlan.createdTime);
    
    // Reset time part to get accurate date difference
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const planStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    
    const usedDays = Math.floor((nowDate.getTime() - planStartDate.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate total days in period
    const totalDays = Math.floor((new Date(currentPlan.expireTime).getTime() - new Date(currentPlan.createdTime).getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate remaining days
    const remainingDays = Math.max(totalDays - usedDays, 0);

    // Calculate daily rate for current plan
    const currentDailyRate = currentPlan.price / totalDays;

    // Calculate refund for unused days
    const refundAmount = currentDailyRate * remainingDays;

    // Calculate final upgrade price
    const upgradeCost = targetPlan.price - refundAmount;
    
    return Math.max(0, Math.round(upgradeCost * 100) / 100);
  }

  private isValidUpgrade(currentPlan: any, targetPlan: any): boolean {
    if (!currentPlan) return true;
    
    // If current plan is yearly, can't downgrade to monthly
    if (currentPlan.period_type === 2 && targetPlan.period_type === 1) return false;
    
    // If same period type, can't select lower or equal level
    if (targetPlan.period_type === currentPlan.period_type && targetPlan.level <= currentPlan.level) return false;
    
    return true;
  }

  async createOrder(userId: string, dto: CreateOrderDTO): Promise<OrderResponse> {
    try {
      // Get target plan details
      const targetPlan = await this.memberPlanService.getPlanById(dto.plan_id);
      if (!targetPlan) {
        throw new Error('Invalid plan selected');
      }

      // Get current user benefits
      const currentBenefits = await this.benefitsService.getUserBenefits(userId);
      let amount = targetPlan.price

      // diff amount
      if (currentBenefits?.membership) {
        const current = await this.memberPlanService.getPlanById(currentBenefits?.membership.planId);

        const currentPlan = {
          ...current,
          createdTime: currentBenefits?.membership.createdTime,
          expireTime: currentBenefits?.membership.expireTime
        }

        // Validate upgrade path
        if (!this.isValidUpgrade(currentPlan, targetPlan)) {
          throw new Error('Invalid plan upgrade path');
        }

        amount = this.calculateUpgradePrice(currentPlan, targetPlan);
      }


      // Generate order number
      const orderNo = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const orderId = uuidv4();

      // Create order record
      const order = await this.orderRepository.create({
        id: orderId,
        order_no: orderNo,
        user_id: userId,
        plan_id: dto.plan_id,
        amount: amount,
        status: OrderStatus.PENDING,
        pay_type: dto.pay_type,
        expire_time: new Date(Date.now() + paymentConfig.order.expireTime * 1000),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      // Generate payment URL
      const payment = await this.paymentService.createPayment({
        orderNo: order.order_no,
        orderId: order.id,
        subject: `${targetPlan.name} Subscription`,
        body: `Subscription for ${targetPlan.name}`,
        amount: parseFloat(order.amount.toString()),
        userId: userId,
        payType: dto.pay_type
      });

      logger.info('Order created with payment URL', {
        orderId: order.id,
        orderNo: order.order_no,
        payUrl: payment.payUrl,
        amount: amount,
        targetPlan: targetPlan.name
      });

      return {
        ...order,
        payUrl: payment.payUrl 
      };
    } catch (error) {
      logger.error('Failed to create order', {
        error,
        userId,
        planId: dto.plan_id
      });
      throw error;
    }
  }

  async getOrders(params: OrderQueryParams) {
    try {
      return await this.orderRepository.findOrders(params);
    } catch (error) {
      logger.error('Failed to get orders', {
        error,
        params
      });
      throw error;
    }
  }

  async getOrderDetail(orderId: string, userId: string) {
    try {
      const order = await this.orderRepository.findById(orderId);
      
      if (!order) {
        throw new Error('Order not found');
      }

      if (order.user_id !== userId) {
        throw new Error('Unauthorized access to order');
      }

      // Get plan details
      const plan = await this.memberPlanService.getPlanById(order.plan_id);
      if (!plan) {
        throw new Error('Plan not found');
      }

      return {
        ...order,
        plan: {
          name: plan.name,
          level: plan.level,
          period_type: plan.period_type,
          detection_quota: plan.detection_quota,
          rewrite_quota: plan.rewrite_quota
        }
      };
    } catch (error) {
      logger.error('Failed to get order detail', {
        error,
        orderId,
        userId
      });
      throw error;
    }
  }
}