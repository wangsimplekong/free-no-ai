import api from '../lib/api'
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  OrderListParams,
  OrderListResponse,
  PaymentUrlResponse,
  Order,
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

  async getOrderDetail(orderId: string) {
    const response = await api.get<{ code: number; message: string; data: Order; timestamp: number }>(
      `/api/orders/detail/${orderId}`)
    return response.data
  }
}

export const orderService = new OrderService()
export default orderService
