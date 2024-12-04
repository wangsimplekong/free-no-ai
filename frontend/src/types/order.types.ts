export interface CreateOrderRequest {
  plan_id: string;
  pay_type: number;
}

export interface CreateOrderResponse {
  code: number;
  message: string;
  data: {
    id: string;
    order_no: string;
    amount: number;
    payUrl: string;
    expire_time: string;
    status: number
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