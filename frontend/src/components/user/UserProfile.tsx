import React, { useState } from 'react';
import { User, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';
import { BenefitsModal } from '../../pages/membership/components/BenefitsModal';

interface UserProfileProps {
  variant?: 'header' | 'compact';
  showDropdown?: boolean;
  onLogout?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  variant = 'header',
  showDropdown = true,
  onLogout
}) => {
  const [isBenefitsModalOpen, setIsBenefitsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const { user, benefits, logout } = useAuthStore();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    onLogout?.();
  };

  const displayName = user.nickname || user.username;
  const planName = benefits?.membership.planName || '普通会员';

  if (variant === 'compact') {
    return (
      <>
        <button 
          onClick={() => setIsBenefitsModalOpen(true)}
          className="flex items-center space-x-2"
        >
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            {user.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-gray-500" />
            )}
          </div>
          <div className="text-sm">
            <div className="font-medium">{displayName}</div>
            <div className="text-gray-500">{planName}</div>
          </div>
        </button>

        <BenefitsModal
          isOpen={isBenefitsModalOpen}
          onClose={() => setIsBenefitsModalOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <div className="relative">
        <button 
          className="flex items-center space-x-2"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          onBlur={() => setTimeout(() => setIsDropdownOpen(false), 100)}
        >
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            {user.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-gray-500" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">{displayName}</span>
            <span className="text-xs text-gray-500">{planName}</span>
          </div>
          {showDropdown && <ChevronDown className="w-4 h-4 text-gray-500" />}
        </button>

        {showDropdown && (
          <div className={`absolute right-0 mt-2 w-48 py-2 bg-white rounded-lg shadow-xl transition-all duration-200 ${
            isDropdownOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}>
            <button
              onClick={() => {
                setIsDropdownOpen(false);
                setIsBenefitsModalOpen(true);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              我的权益
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              退出登录
            </button>
          </div>
        )}
      </div>

      <BenefitsModal
        isOpen={isBenefitsModalOpen}
        onClose={() => setIsBenefitsModalOpen(false)}
      />
    </>
  );
};