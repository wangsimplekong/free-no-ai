import React from 'react';
import { Check } from 'lucide-react';
import { MemberPlan } from '../../types/member.types';
import { UserBenefits } from '../../types/auth.types';
import { isPlanUpgradable, calculateUpgradePrice, formatPrice } from '../../utils/plan.utils';

interface PlanFeature {
  title: string;
  value: string;
}

interface PlanCardProps {
  plan: MemberPlan;
  currentPlan: UserBenefits['membership'] | null;
  features: PlanFeature[];
  isPopular?: boolean;
  onSelect: () => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  currentPlan,
  features,
  isPopular,
  onSelect
}) => {
  const isUpgradable = currentPlan ? isPlanUpgradable(currentPlan, plan) : true;
  const upgradePrice = currentPlan ? calculateUpgradePrice(currentPlan, plan) : plan.price;

  const getButtonText = () => {
    if (!currentPlan) return '立即开通';
    if (isDisabled()) return '立即开通';
    return `升级补差价 ¥${formatPrice(upgradePrice)}`;
  };

  const isDisabled = () => {
    if (!currentPlan) return false;
    
    // If current plan is yearly, can't downgrade to monthly
    if (currentPlan.period_type === 2 && plan.period_type === 1) return true;
    
    // If same period type, can't select lower or equal level
    if (plan.period_type === currentPlan.period_type && plan.level <= currentPlan.level) return true;
    
    return false;
  };

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
        <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
        
        <div className="mt-4 flex items-baseline">
          <span className="text-3xl font-bold">¥{formatPrice(plan.price)}</span>
          <span className="ml-2 text-gray-500">/{plan.period_type === 1 ? '月' : '年'}</span>
        </div>

        {plan.period_type === 2 && (
          <div className="mt-1 text-sm text-gray-500">
            月均 ¥{formatPrice(plan.price / 12)} 起
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
          disabled={isDisabled()}
          className={`mt-8 w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isDisabled()
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isPopular
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          }`}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};