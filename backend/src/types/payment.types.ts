export interface PaymentRequest {
  orderNo: string;
  orderId: string;
  subject: string;
  body: string;
  amount: number;
  userId: string;
  payType: number;
}

export interface PaymentResponse {
  payUrl: string;
  qrCode: string;
  orderId: string;
  orderNo: string;
  amount: number;
  expireTime: string;
}

export interface PaymentCallback {
  order_id: string;
  trade_no: string;
  pay_status: number;
  sign: string;
  [key: string]: any;
}

export interface PaymentResult {
  success: boolean;
  orderId: string;
  tradeNo: string;
  errorMessage?: string;
}

export interface PaymentStatus {
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED';
  orderNo: string;
  message?: string;
}