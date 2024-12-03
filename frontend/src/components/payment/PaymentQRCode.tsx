import QRCode from 'qrcode.react';
import { useOrderStatus } from '@/hooks/useOrderStatus';

interface PaymentQRCodeProps {
  order: Order;
  onSuccess?: () => void;
  onFailed?: () => void;
}

export const PaymentQRCode: React.FC<PaymentQRCodeProps> = ({
  order,
  onSuccess,
  onFailed
}) => {
  const { status, loading } = useOrderStatus(order.orderNo);

  useEffect(() => {
    if (status === OrderStatus.PAID) {
      onSuccess?.();
    } else if (status === OrderStatus.FAILED) {
      onFailed?.();
    }
  }, [status]);

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">
        支付金额: ¥{order.amount.toFixed(2)}
      </h3>
      <div className="p-4 bg-white rounded-lg shadow-inner">
        {loading ? (
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span>加载中...</span>
          </div>
        ) : (
          <QRCode 
            value={order.payUrl} 
            size={200}
            level="H"
            includeMargin={true}
          />
        )}
      </div>
      <p className="mt-4 text-sm text-gray-500">
        请使用微信或支付宝扫码支付
      </p>
      <div className="mt-4 text-xs text-gray-400">
        订单将在 {new Date(order.expireTime).toLocaleString()} 过期
      </div>
    </div>
  );
}; 