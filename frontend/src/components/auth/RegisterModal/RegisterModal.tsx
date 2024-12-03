import React, { useState } from 'react';
import { X, Mail, Phone } from 'lucide-react';
import VerificationRegister from './VerificationRegister';

type RegisterMethod = 'phone' | 'email';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose }) => {
  const [registerMethod, setRegisterMethod] = useState<RegisterMethod>('phone');

  if (!isOpen) return null;

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
          <h2 className="text-xl font-semibold text-gray-900">注册 FreenoAI</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Register Methods Selector */}
        <div className="flex space-x-4 p-6">
          <button
            onClick={() => setRegisterMethod('phone')}
            className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded-lg border transition-all ${
              registerMethod === 'phone'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <Phone className={`w-5 h-5 ${
              registerMethod === 'phone' ? 'text-blue-500' : 'text-gray-400'
            }`} />
            <span className="font-medium">手机号注册</span>
          </button>
          <button
            onClick={() => setRegisterMethod('email')}
            className={`flex-1 flex items-center justify-center space-x-2 p-3 rounded-lg border transition-all ${
              registerMethod === 'email'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <Mail className={`w-5 h-5 ${
              registerMethod === 'email' ? 'text-blue-500' : 'text-gray-400'
            }`} />
            <span className="font-medium">邮箱注册</span>
          </button>
        </div>

        {/* Register Content */}
        <div className="px-6 pb-6">
          <VerificationRegister 
            type={registerMethod} 
            onSuccess={onClose}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-xl text-center text-sm text-gray-500">
          注册即表示同意
          <a href="#" className="text-blue-600 hover:text-blue-700">《服务条款》</a>
          和
          <a href="#" className="text-blue-600 hover:text-blue-700">《隐私政策》</a>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;