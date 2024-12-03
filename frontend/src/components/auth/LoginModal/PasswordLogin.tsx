import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../../stores/auth.store';
import type { ErrorResponse } from '../../../types/auth.types';

interface PasswordLoginProps {
  onRegister: () => void;
  onSuccess: () => void;
}

const PasswordLogin: React.FC<PasswordLoginProps> = ({ onRegister, onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!username || !password) {
      setError('请输入账号和密码');
      return;
    }

    try {
      setError(null);
      await login({ username, password });
      onSuccess(); // Close modal after successful login
    } catch (err) {
      const error = err as ErrorResponse;
      setError(error.message || '登录失败，请稍后重试');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
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

      <div>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="手机号/邮箱"
          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="请输入密码"
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

      <div className="flex justify-end">
        <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
          忘记密码？
        </a>
      </div>

      <button
        onClick={handleLogin}
        disabled={isLoading || !username || !password}
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

export default PasswordLogin;