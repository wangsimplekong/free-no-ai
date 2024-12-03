export enum OrderStatus {
  PENDING = 1,
  PAID = 2,
  CANCELLED = 3,
  REFUNDED = 4
}

export enum PayType {
  WECHAT = 1,
  ALIPAY = 2
}

export interface CreateOrderDTO {
  plan_id: string;
  pay_type: PayType;
}

export interface OrderResponse {
  order_id: string;
  order_no: string;
  amount: number;
  pay_url: string;
  expire_time: string;
}