import React, { useState, useEffect } from 'react';
import { MembershipHeader } from './components/MembershipHeader';
import { PlanTabs } from './components/PlanTabs';
import { PlanCard } from './components/PlanCard';
import { PaymentSection } from './components/PaymentSection';
import { BenefitsModal } from './components/BenefitsModal';
import { useAuthCheck } from '../../hooks/useAuthCheck';
import { memberService } from '../../services/member.service';
import { useLoginModal } from '../../hooks/useLoginModal';
import { useAuthStore } from '../../stores/auth.store';
import type { MemberPlan } from '../../types/member.types';

export const MembershipPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<MemberPlan | null>(null);
  const [plans, setPlans] = useState<MemberPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingPlan, setPendingPlan] = useState<MemberPlan | null>(null);
  const [isBenefitsModalOpen, setIsBenefitsModalOpen] = useState(false);
  
  const { checkAuth } = useAuthCheck();
  const { openLoginModal } = useLoginModal();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated());
  const benefits = useAuthStore(state => state.benefits);

  useEffect(() => {
    fetchPlans();
  }, []);

  // Handle authentication state changes
  useEffect(() => {
    if (isAuthenticated && pendingPlan) {
      setSelectedPlan(pendingPlan);
      setPendingPlan(null);
    }
  }, [isAuthenticated, pendingPlan]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await memberService.getPlans();
      setPlans(data);
    } catch (err) {
      setError('获取套餐信息失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPlans = () => {
    const periodType = activeTab === 'monthly' ? 1 : 2;
    return plans
      .filter(plan => plan.status === 1 && plan.period_type === periodType)
      .sort((a, b) => a.level - b.level);
  };

  const formatFeatures = (plan: MemberPlan) => [
    { title: '检测字数', value: plan.detection_quota <= 0 ? '不限' : `${plan.detection_quota.toLocaleString()}字/月` },
    { title: '降重字数', value: plan.rewrite_quota <= 0 ? '不限' : `${plan.rewrite_quota.toLocaleString()}字/月` }
  ];

  const handlePlanSelect = (plan: MemberPlan) => {
    if (!isAuthenticated) {
      setPendingPlan(plan);
      openLoginModal();
      return;
    }
    setSelectedPlan(plan);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MembershipHeader onBenefitsClick={() => setIsBenefitsModalOpen(true)} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PlanTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {error && (
          <div className="text-center mb-8">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchPlans}
              className="mt-2 text-blue-600 hover:text-blue-700"
            >
              重试
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {getFilteredPlans().map((plan) => (
              <PlanCard
                key={plan.id}
                name={plan.name}
                price={plan.price}
                period={activeTab}
                features={formatFeatures(plan)}
                isPopular={plan.level === 3}
                onSelect={() => handlePlanSelect(plan)}
              />
            ))}
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-center mb-8">常见问题</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="font-medium mb-2">如何选择合适的套餐？</h3>
              <p className="text-gray-600">
                根据您的使用需求选择合适的套餐。基础版适合轻度使用，标准版满足大多数用户需求，高级版则提供无限制使用。
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <h3 className="font-medium mb-2">套餐可以随时更换吗？</h3>
              <p className="text-gray-600">
                是的，您可以随时升级套餐。升级后，将按照新套餐的价格进行补差价，原套餐的剩余时间将按比例转换。
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold mb-4">需要帮助？</h2>
          <p className="text-gray-600 mb-4">
            如果您有任何问题，请随时联系我们的客服团队
          </p>
          <div className="flex justify-center space-x-8">
            <div>
              <div className="font-medium">客服邮箱</div>
              <div className="text-gray-600">support@freenoai.com</div>
            </div>
            <div>
              <div className="font-medium">工作时间</div>
              <div className="text-gray-600">周一至周日 9:00-21:00</div>
            </div>
          </div>
        </div>
      </main>

      {selectedPlan && (
        <PaymentSection
          selectedPlan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
        />
      )}

      <BenefitsModal 
        isOpen={isBenefitsModalOpen}
        onClose={() => setIsBenefitsModalOpen(false)}
      />
    </div>
  );
};