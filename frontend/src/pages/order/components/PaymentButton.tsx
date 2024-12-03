import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { paymentService } from '../../../services/payment.service';
import toast from 'react-hot-toast';
import type { Order } from '../../../types/order.types';

interface PaymentButtonProps {
  order: Order;
  onSuccess: () => void;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({ order, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      const response = await paymentService.completePayment(order.id);
      
      if (response.code === 200) {
        toast.success('支付完成');
        onSuccess();
      } else {
        throw new Error(response.message || '支付失败');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '支付失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="inline-flex items-center px-3 py-1 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin mr-1" />
          <span>处理中...</span>
        </>
      ) : (
        <span>完成支付</span>
      )}
    </button>
  );
};