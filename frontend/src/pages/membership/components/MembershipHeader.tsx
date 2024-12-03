import React from 'react';
import { ArrowLeft, Globe2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UserProfile } from '../../../components/user/UserProfile';
import { useAuthStore } from '../../../stores/auth.store';

interface MembershipHeaderProps {
  onBenefitsClick: () => void;
}

export const MembershipHeader: React.FC<MembershipHeaderProps> = ({ onBenefitsClick }) => {
  const user = useAuthStore(state => state.user);

  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5 mr-2" />
              返回首页
            </Link>
            <div className="text-sm text-gray-600">
              <span className="text-gray-400">当前位置：</span>
              首页 / 会员中心
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <button className="flex items-center text-gray-600 hover:text-gray-900">
              <Globe2 className="w-5 h-5 mr-1" />
              <span>中文</span>
            </button>
            {user ? (
              <UserProfile />
            ) : (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                <div className="text-sm">
                  <div className="font-medium">游客</div>
                  <div className="text-gray-500">余额：¥0.00</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};