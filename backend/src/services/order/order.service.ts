import { v4 as uuidv4 } from 'uuid';
import { OrderRepository } from '../../repositories/order/order.repository';
import { MemberPlanService } from '../../services/member/plan.service';
import { PaymentService } from '../../services/payment/payment.service';
import { CreateOrderDTO, OrderResponse, OrderStatus } from '../../types/order.types';
import { logger } from '../../utils/logger';

interface OrderQueryParams {
  page: number;
  pageSize: number;
  userId?: string;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
}

export class OrderService {
  constructor(
    private orderRepository: OrderRepository,
    private memberPlanService: MemberPlanService,
    private paymentService: PaymentService
  ) {}

  async createOrder(userId: string, dto: CreateOrderDTO): Promise<OrderResponse> {
    try {
      // Get plan details
      const plan = await this.memberPlanService.getPlanById(dto.plan_id);
      if (!plan) {
        throw new Error('Invalid plan selected');
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
        amount: parseFloat(plan.price.toString()),
        status: OrderStatus.PENDING,
        pay_type: dto.pay_type,
        expire_time: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes expiry
      });

      // // Generate payment URL
      // const payment = await this.paymentService.createPayment({
      //   orderNo: order.order_no,
      //   orderId: order.id,
      //   subject: `${plan.name} Subscription`,
      //   body: `Subscription for ${plan.name}`,
      //   amount: parseFloat(order.amount.toString()),
      //   userId: userId
      // });

      // logger.info('Order created with payment URL', {
      //   orderId: order.id,
      //   orderNo: order.order_no,
      //   payUrl: payment.payUrl
      // });

      return {
        ...order
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
}