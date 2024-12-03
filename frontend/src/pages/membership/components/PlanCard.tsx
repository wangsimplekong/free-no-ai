import React from 'react';
import { Check } from 'lucide-react';

interface PlanFeature {
  title: string;
  value: string;
}

interface PlanCardProps {
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: PlanFeature[];
  isPopular?: boolean;
  onSelect: () => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  name,
  price,
  period,
  features,
  isPopular,
  onSelect
}) => {
  return (
    <div className={`relative bg-white rounded-2xl shadow-sm transition-shadow hover:shadow-md ${
      isPopular ? 'border-2 border-blue-500' : 'border border-gray-200'
    }`}>
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded-full">
            推荐套餐
          </div>
        </div>
      )}

      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
        
        <div className="mt-4 flex items-baseline">
          <span className="text-3xl font-bold">¥{price}</span>
          <span className="ml-2 text-gray-500">/{period === 'monthly' ? '月' : '年'}</span>
        </div>

        {period === 'yearly' && (
          <div className="mt-1 text-sm text-gray-500">
            月均 ¥{Math.round(price / 12)} 起
          </div>
        )}

        <ul className="mt-6 space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0" />
              <span className="text-gray-600">
                {feature.title}：
                <span className="font-medium text-gray-900">{feature.value}</span>
              </span>
            </li>
          ))}
        </ul>

        <button
          onClick={onSelect}
          className={`mt-8 w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isPopular
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}
        >
          立即开通
        </button>
      </div>
    </div>
  );
};