import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { useAuthStore } from '../../../stores/auth.store';

interface BenefitsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BenefitsModal: React.FC<BenefitsModalProps> = ({ isOpen, onClose }) => {
  const benefits = useAuthStore(state => state.benefits);

  const formatNumber = (num: number) => {
    if (num === 0) return '不限';
    return num.toLocaleString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatQuota = (quota?: { total: number; used: number; remaining: number }) => {
    if (!quota) {
      return {
        total: '0',
        used: `${0}字`,
        remaining: '0'
      }
    }
    if (quota.total === 0) {
      return {
        total: '不限',
        used: `${quota.used}字`,
        remaining: '不限'
      };
    }

    return {
      total: `${formatNumber(quota.total)}字`,
      used: `${quota.used}字`,
      remaining: `${formatNumber(quota.remaining)}字`
    };
  };

  const detectionQuota = formatQuota(benefits?.quotas.detection);
  const rewriteQuota = formatQuota(benefits?.quotas.rewrite);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="我的权益">
      <div className="space-y-6">
        {/* Membership Info */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">当前套餐</span>
            <span className="font-medium">{benefits ? benefits?.membership.planName : '基础会员'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">到期时间</span>
            <span className="text-sm text-gray-500">
              {benefits ? formatDate(benefits?.membership.expireTime || '-') : '-'}
            </span>
          </div>
        </div>

        {/* Detection Quota */}
        <div className="space-y-2">
          <h4 className="font-medium">AIGC检测额度</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">总额度</span>
              <span>{detectionQuota.total}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">已使用</span>
              <span>{detectionQuota.used}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">剩余额度</span>
              <span className="text-blue-600 font-medium">
                {detectionQuota.remaining}
              </span>
            </div>
          </div>
        </div>

        {/* Rewrite Quota */}
        <div className="space-y-2">
          <h4 className="font-medium">AIGC降重额度</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">总额度</span>
              <span>{rewriteQuota.total}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">已使用</span>
              <span>{rewriteQuota.used}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">剩余额度</span>
              <span className="text-blue-600 font-medium">
                {rewriteQuota.remaining}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};