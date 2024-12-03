import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';
import { authService } from '../../../services/auth.service';
import { ErrorResponse, VerificationType, VerificationPurpose, RegisterSource } from '../../../types/auth.types';

interface VerificationRegisterProps {
  type: 'phone' | 'email';
  onSuccess: () => void;
}

const VerificationRegister: React.FC<VerificationRegisterProps> = ({ type, onSuccess }) => {
  const [recipient, setRecipient] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const { register, isLoading } = useAuthStore();

  const handleSendCode = async () => {
    if (!recipient) {
      setError('请输入' + (type === 'phone' ? '手机号' : '邮箱地址'));
      return;
    }

    try {
      setError(null);
      setIsSending(true);
      await authService.sendVerification({
        recipient,
        type: type === 'phone' ? VerificationType.SMS : VerificationType.EMAIL,
        purpose: VerificationPurpose.REGISTER
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

  const handleRegister = async () => {
    if (!recipient || !code || !password) {
      setError('请填写完整信息');
      return;
    }

    if (password.length < 8) {
      setError('密码长度不能少于8位');
      return;
    }

    try {
      setError(null);
      await register({
        username: recipient,
        password,
        code,
        register_source: type === 'phone' ? RegisterSource.PHONE : RegisterSource.EMAIL
      });
      onSuccess(); // Close modal after successful registration
    } catch (err) {
      const error = err as ErrorResponse;
      setError(error.message || '注册失败，请稍后重试');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && !isSending) {
      handleRegister();
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      {/* Recipient Input */}
      <div>
        <input
          type={type === 'phone' ? 'tel' : 'email'}
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder={type === 'phone' ? '请输入手机号' : '请输入邮箱地址'}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Verification Code */}
      <div className="flex space-x-4">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
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

      {/* Password Input */}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="请设置登录密码"
          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Register Button */}
      <button
        onClick={handleRegister}
        disabled={isLoading || !recipient || !code || !password}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>注册中...</span>
          </>
        ) : (
          <span>注册</span>
        )}
      </button>

      <div className="text-center">
        <span className="text-sm text-gray-500">
          已有账号？
          <button 
            onClick={onSuccess}
            className="text-blue-600 hover:text-blue-700 ml-1"
          >
            立即登录
          </button>
        </span>
      </div>
    </div>
  );
};

export default VerificationRegister;