import React, { useState } from 'react';
import { QrCode, CreditCard, Loader2, ArrowUpRight } from 'lucide-react';
import toast from 'react-hot-toast';
import type { MemberPlan } from '../../../types/member.types';
import type { UserBenefits } from '../../../types/auth.types';
import { orderService } from '../../../services/order.service';
import { calculateUpgradePrice, formatPrice, isPlanUpgradable } from '../../../utils/plan.utils';

interface PaymentSectionProps {
  selectedPlan: MemberPlan;
  currentPlan: UserBenefits['membership'] | null;
  onClose: () => void;
}

type PaymentMethodType = 'wechat' | 'alipay' | 'paypal';

export const PaymentSection: React.FC<PaymentSectionProps> = ({
  selectedPlan,
  currentPlan,
  onClose
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('wechat');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payUrl, setPayUrl] = useState<string | null>(null);

  const isUpgrade = currentPlan && isPlanUpgradable(currentPlan, selectedPlan);
  const finalPrice = currentPlan 
    ? calculateUpgradePrice(currentPlan, selectedPlan)
    : selectedPlan.price;

  const getPayType = (method: PaymentMethodType): number => {
    switch (method) {
      case 'wechat':
        return 1;
      case 'alipay':
        return 2;
      default:
        return 1;
    }
  };

  const handleCreateOrder = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await orderService.createOrder({
        plan_id: selectedPlan.id,
        pay_type: getPayType(paymentMethod),
        upgrade_from: currentPlan ? currentPlan.planName : undefined
      });

      setPayUrl(response.data.pay_url);
      toast.success('订单创建成功！');
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建订单失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">确认支付</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            {isUpgrade && (
              <div className="mb-3 flex items-center text-blue-600 text-sm font-medium">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                升级订单
              </div>
            )}
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">套餐名称</span>
              <span className="font-medium">{selectedPlan.name}</span>
            </div>
            {currentPlan && (
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">当前套餐</span>
                <span className="font-medium">{currentPlan.planName}</span>
              </div>
            )}
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">
                {isUpgrade ? '补差价金额' : '支付金额'}
              </span>
              <span className="font-medium text-lg">¥{formatPrice(finalPrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">有效期限</span>
              <span className="font-medium">
                {selectedPlan.period_type === 1 ? '1个月' : '12个月'}
              </span>
            </div>
            {isUpgrade && (
              <div className="mt-3 text-sm text-gray-500">
                *升级费用已按剩余时间自动计算差价
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Payment Methods */}
          <div>
            <h4 className="font-medium mb-3">选择支付方式</h4>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setPaymentMethod('wechat')}
                className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
                  paymentMethod === 'wechat'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <QrCode className={`w-6 h-6 ${
                  paymentMethod === 'wechat' ? 'text-blue-500' : 'text-gray-400'
                }`} />
                <span className="mt-1 text-sm">微信支付</span>
              </button>
              <button
                onClick={() => setPaymentMethod('alipay')}
                className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
                  paymentMethod === 'alipay'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <CreditCard className={`w-6 h-6 ${
                  paymentMethod === 'alipay' ? 'text-blue-500' : 'text-gray-400'
                }`} />
                <span className="mt-1 text-sm">支付宝</span>
              </button>
              <button
                onClick={() => setPaymentMethod('paypal')}
                className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
                  paymentMethod === 'paypal'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <CreditCard className={`w-6 h-6 ${
                  paymentMethod === 'paypal' ? 'text-blue-500' : 'text-gray-400'
                }`} />
                <span className="mt-1 text-sm">PayPal</span>
              </button>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              {isLoading ? (
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                  <span className="text-gray-500">获取支付二维码...</span>
                </div>
              ) : payUrl ? (
                <img 
                  src={payUrl} 
                  alt="支付二维码"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-gray-500">点击下方按钮获取支付二维码</span>
              )}
            </div>
            <p className="mt-3 text-sm text-gray-500">
              请使用{
                paymentMethod === 'wechat' ? '微信' :
                paymentMethod === 'alipay' ? '支付宝' : 'PayPal'
              }扫码支付
            </p>
            <button 
              onClick={handleCreateOrder}
              disabled={isLoading}
              className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>处理中...</span>
                </>
              ) : (
                <span>
                  {isUpgrade ? '确认升级' : '确认支付'} ¥{formatPrice(finalPrice)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};