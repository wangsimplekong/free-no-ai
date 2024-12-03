import React from 'react';

interface PlanTabsProps {
  activeTab: 'monthly' | 'yearly';
  onTabChange: (tab: 'monthly' | 'yearly') => void;
}

export const PlanTabs: React.FC<PlanTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex justify-center mb-8">
      <div className="inline-flex rounded-lg p-1 bg-gray-100">
        <button
          onClick={() => onTabChange('monthly')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'monthly'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          月度套餐
        </button>
        <button
          onClick={() => onTabChange('yearly')}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'yearly'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          年度套餐
        </button>
      </div>
    </div>
  );
};