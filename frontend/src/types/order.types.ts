export interface CreateOrderRequest {
  plan_id: string;
  pay_type: number;
}

export interface CreateOrderResponse {
  code: number;
  message: string;
  data: {
    order_id: string;
    order_no: string;
    amount: number;
    pay_url: string;
    expire_time: string;
  };
  timestamp: number;
}
export interface Order {
  id: string;
  order_no: string;
  amount: number;
  status: number;
  created_at: string;
  updated_at: string;
  pay_url?: string;
}

export interface OrderListResponse {
  data: Order[];
  total: number;
  page: number;
  pageSize: number;
}

export interface OrderListParams {
  page?: number;
  pageSize?: number;
  status?: number;
  startDate?: string;
  endDate?: string;
}

export interface PaymentUrlResponse {
  pay_url: string;
}