import { Request, Response } from 'express';
import { OrderService } from '../../services/order/order.service';
import { OrderRepository } from '../../repositories/order/order.repository';
import { MemberPlanService } from '../../services/member/plan.service';
import { PaymentService } from '../../services/payment/payment.service';
import { logger } from '../../utils/logger';
import { successResponse, errorResponse } from '../../utils/response.util';
import { CreateOrderDTO, OrderResponse, OrderStatus } from '../../types/order.types';
import { v4 as uuidv4 } from 'uuid';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    const orderRepository = new OrderRepository();
    const memberPlanService = new MemberPlanService();
    const paymentService = new PaymentService();
    this.orderService = new OrderService(orderRepository, memberPlanService, paymentService);
  }

  public createOrder = async (req: Request, res: Response): Promise<void> => {
    const requestId = uuidv4();
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        logger.error('User ID not found in request', {
          requestId,
          user: (req as any).user,
          headers: req.headers
        });
        throw new Error('User not authenticated');
      }
      
      logger.info('Creating new order', {
        requestId,
        userId,
        planId: req.body.plan_id,
        payType: req.body.pay_type
      });

      const orderDto: CreateOrderDTO = {
        plan_id: req.body.plan_id,
        pay_type: req.body.pay_type
      };

      const result = await this.orderService.createOrder(userId, orderDto);

      logger.info('Order created successfully', {
        requestId,
        orderId: result.order_id
      });

      res.status(200).json(successResponse(result));
    } catch (error) {
      logger.error('Failed to create order', {
        requestId,
        error,
        body: req.body,
        user: (req as any).user
      });

      const message = error instanceof Error ? error.message : 'Failed to create order';
      res.status(400).json(errorResponse(message));
    }
  };

  public getOrders = async (req: Request, res: Response): Promise<void> => {
    const requestId = uuidv4();
    try {
      const userId = (req as any).user?.id;
      const { page = '1', pageSize = '10', status, startDate, endDate } = req.query;

      logger.info('Fetching orders', {
        requestId,
        userId,
        page,
        pageSize,
        status,
        startDate,
        endDate
      });

      const result = await this.orderService.getOrders({
        page: parseInt(page as string, 10),
        pageSize: parseInt(pageSize as string, 10),
        userId,
        status: status ? parseInt(status as string, 10) : undefined,
        startDate: startDate as string,
        endDate: endDate as string
      });

      logger.info('Orders fetched successfully', {
        requestId,
        total: result.total,
        page: result.page
      });

      res.status(200).json(successResponse(result));
    } catch (error) {
      logger.error('Failed to fetch orders', {
        requestId,
        error,
        query: req.query,
        user: (req as any).user
      });

      const message = error instanceof Error ? error.message : 'Failed to fetch orders';
      res.status(400).json(errorResponse(message));
    }
  };

  public getOrderDetail = async (req: Request, res: Response): Promise<void> => {
    const requestId = uuidv4();
    try {
      const { orderId } = req.params;
      const userId = (req as any).user?.id;

      logger.info('Fetching order detail', {
        requestId,
        orderId,
        userId
      });

      const result = await this.orderService.getOrderDetail(orderId, userId);

      logger.info('Order detail fetched successfully', {
        requestId,
        orderId
      });

      res.status(200).json(successResponse(result));
    } catch (error) {
      logger.error('Failed to fetch order detail', {
        requestId,
        error,
        orderId: req.params.orderId,
        user: (req as any).user
      });

      const message = error instanceof Error ? error.message : 'Failed to fetch order detail';
      res.status(400).json(errorResponse(message));
    }
  };
}