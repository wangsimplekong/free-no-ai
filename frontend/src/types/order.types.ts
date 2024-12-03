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