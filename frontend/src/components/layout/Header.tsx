import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoginModal } from '../auth/LoginModal';
import { UserProfile } from '../user/UserProfile';
import { useAuthStore } from '../../stores/auth.store';
import { useLoginModal } from '../../hooks/useLoginModal';

export const Header: React.FC = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { user } = useAuthStore();
  const { openLoginModal } = useLoginModal();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-indigo-600" />
                  <span className="ml-2 text-xl font-bold text-gray-900">FreenoAI</span>
                </div>
              </Link>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/detection" className="text-gray-700 hover:text-indigo-600">AIGC检测</Link>
              <Link to="/reduction" className="text-gray-700 hover:text-indigo-600">AIGC降重</Link>
              <Link to="/membership" className="text-gray-700 hover:text-indigo-600">会员套餐</Link>
              
              {user ? (
                <UserProfile />
              ) : (
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                >
                  登录
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  );
};