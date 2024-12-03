import React from 'react';

interface OrderStatusProps {
  status: number;
}

export const OrderStatus: React.FC<OrderStatusProps> = ({ status }) => {
  const getStatusConfig = (status: number) => {
    switch (status) {
      case 1:
        return {
          text: '待支付',
          className: 'bg-yellow-100 text-yellow-800'
        };
      case 2:
        return {
          text: '已支付',
          className: 'bg-green-100 text-green-800'
        };
      case -1:
        return {
          text: '已取消',
          className: 'bg-gray-100 text-gray-800'
        };
      default:
        return {
          text: '未知状态',
          className: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
      {config.text}
    </span>
  );
};