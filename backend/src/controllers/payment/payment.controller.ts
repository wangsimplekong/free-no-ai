import { Request, Response } from 'express';
import { PaymentService } from '../../services/payment/payment.service';
import { logger } from '../../utils/logger';
import { successResponse, errorResponse } from '../../utils/response.util';

export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  async completePayment(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.body;
      
      logger.info('Processing payment completion', {
        orderId
      });

      const result = await this.paymentService.completePayment(orderId);

      res.json(successResponse(result, '支付完成'));
    } catch (error) {
      logger.error('Payment completion failed:', error);
      res.status(400).json(errorResponse(error instanceof Error ? error.message : '支付处理失败'));
    }
  }

  async createPayment(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.paymentService.createPayment(req.body);
      res.json(successResponse(result, '支付创建成功'));
    } catch (error) {
      logger.error('Payment creation failed:', error);
      res.status(400).json(errorResponse(error instanceof Error ? error.message : '支付创建失败'));
    }
  }

  async handleCallback(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.paymentService.handleCallback(req.body);
      res.json(successResponse(result, '支付回调处理成功'));
    } catch (error) {
      logger.error('Payment callback failed:', error);
      res.status(400).json(errorResponse(error instanceof Error ? error.message : '支付回调处理失败'));
    }
  }

  async getPaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { orderNo } = req.params;
      const result = await this.paymentService.getPaymentStatus(orderNo);
      res.json(successResponse(result, '支付状态查询成功'));
    } catch (error) {
      logger.error('Payment status check failed:', error);
      res.status(400).json(errorResponse(error instanceof Error ? error.message : '支付状态查询失败'));
    }
  }

  async refreshPaymentUrl(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const result = await this.paymentService.refreshPaymentUrl(orderId);
      res.json(successResponse(result, '支付链接刷新成功'));
    } catch (error) {
      logger.error('Payment URL refresh failed:', error);
      res.status(400).json(errorResponse(error instanceof Error ? error.message : '支付链接刷新失败'));
    }
  }
}