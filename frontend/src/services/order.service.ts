import api from '../lib/api'
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  OrderListParams,
  OrderListResponse,
  PaymentUrlResponse,
} from '../types/order.types'

class OrderService {
  async createOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
    const response = await api.post<CreateOrderResponse>(`/api/orders/create`, data)
    return response.data
  }
  async getOrders(params: OrderListParams = {}) {
    const response = await api.get<{ code: number; message: string; data: OrderListResponse; timestamp: number }>(
      '/api/orders/list',
      { params }
    )
    return response.data
  }

  async getPaymentUrl(orderId: string) {
    const response = await api.get<{ code: number; message: string; data: PaymentUrlResponse; timestamp: number }>(
      `/api/orders/${orderId}/pay`
    )
    return response.data
  }
}

export const orderService = new OrderService()
export default orderService
