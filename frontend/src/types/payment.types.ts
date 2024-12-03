export interface PaymentResponse {
  payUrl: string;
  qrCode: string;
  orderId: string;
  orderNo: string;
  amount: number;
  expireTime: string;
}

export interface PaymentStatus {
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED';
  orderNo: string;
  message?: string;
}

export interface PaymentResult {
  success: boolean;
  orderId: string;
  tradeNo: string;
  errorMessage?: string;
}