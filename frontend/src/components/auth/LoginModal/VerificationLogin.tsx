import React, { useState } from 'react';
import { Mail, Phone, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';
import { authService } from '../../../services/auth.service';
import { ErrorResponse, VerificationType, VerificationPurpose } from '../../../types/auth.types';

type VerificationMethodType = 'phone' | 'email';

interface VerificationLoginProps {
  onRegister: () => void;
  onSuccess: () => void;
}

const VerificationLogin: React.FC<VerificationLoginProps> = ({ onRegister, onSuccess }) => {
  const [method, setMethod] = useState<VerificationMethodType>('phone');
  const [recipient, setRecipient] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const { loginWithVerification, isLoading } = useAuthStore();

  const handleSendCode = async () => {
    if (!recipient) {
      setError('请输入' + (method === 'phone' ? '手机号' : '邮箱地址'));
      return;
    }

    try {
      setError(null);
      setIsSending(true);
      await authService.sendVerification({
        recipient,
        type: method === 'phone' ? VerificationType.SMS : VerificationType.EMAIL,
        purpose: VerificationPurpose.LOGIN
      });

      // Start countdown
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      const error = err as ErrorResponse;
      setError(error.message || '发送验证码失败，请稍后重试');
    } finally {
      setIsSending(false);
    }
  };

  const handleLogin = async () => {
    if (!recipient || !code) {
      setError('请填写完整信息');
      return;
    }

    try {
      setError(null);
      await loginWithVerification({
        username: recipient,
        code
      });
      onSuccess(); // Close modal after successful login
    } catch (err) {
      const error = err as ErrorResponse;
      setError(error.message || '登录失败，请稍后重试');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && !isSending) {
      handleLogin();
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      {/* Method Selector */}
      <div className="flex space-x-4 mb-2">
        <button
          onClick={() => setMethod('phone')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            method === 'phone'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>手机号</span>
        </button>
        <button
          onClick={() => setMethod('email')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            method === 'email'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>邮箱</span>
        </button>
      </div>

      {/* Input Fields */}
      <div>
        <input
          type={method === 'phone' ? 'tel' : 'email'}
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder={method === 'phone' ? '请输入手机号' : '请输入邮箱地址'}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex space-x-4">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="请输入验证码"
          maxLength={6}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSendCode}
          disabled={countdown > 0 || !recipient || isSending}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-400 whitespace-nowrap flex items-center space-x-1"
        >
          {isSending && <Loader2 className="w-3 h-3 animate-spin" />}
          <span>{countdown > 0 ? `${countdown}s后重新发送` : '发送验证码'}</span>
        </button>
      </div>

      <button
        onClick={handleLogin}
        disabled={isLoading || !recipient || !code}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>登录中...</span>
          </>
        ) : (
          <span>登录</span>
        )}
      </button>

      <div className="text-center">
        <span className="text-sm text-gray-500">
          还没有账号？
          <button 
            onClick={onRegister}
            className="text-blue-600 hover:text-blue-700 ml-1"
          >
            立即注册
          </button>
        </span>
      </div>
    </div>
  );
};

export default VerificationLogin;