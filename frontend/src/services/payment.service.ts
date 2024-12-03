import api from '../lib/api';
import { PaymentResponse, PaymentStatus } from '../types/payment.types';

export class PaymentService {
  private readonly baseUrl = '/api/payment';

  async createPayment(data: any): Promise<PaymentResponse> {
    return api.post(`${this.baseUrl}/create`, data);
  }

  async getPaymentStatus(orderNo: string): Promise<PaymentStatus> {
    return api.get(`${this.baseUrl}/${orderNo}/status`);
  }

  async refreshPaymentUrl(orderId: string): Promise<PaymentResponse> {
    return api.post(`${this.baseUrl}/${orderId}/refresh`);
  }

  async completePayment(orderId: string): Promise<{ success: boolean }> {
    return api.post(`${this.baseUrl}/complete`, { orderId });
  }
}

export const paymentService = new PaymentService();