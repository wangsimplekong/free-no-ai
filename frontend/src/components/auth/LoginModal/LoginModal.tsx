import React, { useState } from 'react';
import { X, Lock, MessageSquare, QrCode } from 'lucide-react';
import QRCode from './QRCode';
import PasswordLogin from './PasswordLogin';
import VerificationLogin from './VerificationLogin';
import { RegisterModal } from '../RegisterModal';

type LoginMethod = 'password' | 'verification' | 'wechat';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [showRegister, setShowRegister] = useState(false);

  if (!isOpen) return null;

  if (showRegister) {
    return (
      <RegisterModal 
        isOpen={true} 
        onClose={() => {
          setShowRegister(false);
          onClose();
        }}
        onLogin={() => setShowRegister(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl transform transition-all duration-200 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">登录 FreenoAI</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Login Methods Selector */}
        <div className="grid grid-cols-3 gap-4 p-6">
          <button
            onClick={() => setLoginMethod('password')}
            className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
              loginMethod === 'password'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <Lock className={`w-6 h-6 ${
              loginMethod === 'password' ? 'text-blue-500' : 'text-gray-400'
            }`} />
            <span className="mt-2 text-sm font-medium">账号密码</span>
          </button>
          <button
            onClick={() => setLoginMethod('verification')}
            className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
              loginMethod === 'verification'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <MessageSquare className={`w-6 h-6 ${
              loginMethod === 'verification' ? 'text-blue-500' : 'text-gray-400'
            }`} />
            <span className="mt-2 text-sm font-medium">验证码登录</span>
          </button>
          <button
            onClick={() => setLoginMethod('wechat')}
            className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
              loginMethod === 'wechat'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <QrCode className={`w-6 h-6 ${
              loginMethod === 'wechat' ? 'text-blue-500' : 'text-gray-400'
            }`} />
            <span className="mt-2 text-sm font-medium">微信登录</span>
          </button>
        </div>

        {/* Login Content */}
        <div className="px-6 pb-6">
          {loginMethod === 'password' && (
            <PasswordLogin 
              onRegister={() => setShowRegister(true)} 
              onSuccess={onClose}
            />
          )}
          {loginMethod === 'verification' && (
            <VerificationLogin 
              onRegister={() => setShowRegister(true)} 
              onSuccess={onClose}
            />
          )}
          {loginMethod === 'wechat' && <QRCode />}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-xl text-center text-sm text-gray-500">
          登录即表示同意
          <a href="#" className="text-blue-600 hover:text-blue-700">《服务条款》</a>
          和
          <a href="#" className="text-blue-600 hover:text-blue-700">《隐私政策》</a>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;