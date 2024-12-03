import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { userService } from '../../../services/user.service';
import { authService } from '../../../services/auth.service';
import { VerificationType, VerificationPurpose } from '../../../types/auth.types';
import { useAuthStore } from '../../../stores/auth.store';
import toast from 'react-hot-toast';

export const SecuritySettings: React.FC = () => {
  const user = useAuthStore(state => state.user);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async () => {
    if (!user?.username) return;

    try {
      setIsSendingCode(true);
      setError(null);
      
      await authService.sendVerification({
        recipient: user.username,
        type: user.username.includes('@') ? VerificationType.EMAIL : VerificationType.SMS,
        purpose: VerificationPurpose.RESET_PASSWORD
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

      toast.success('验证码已发送');
    } catch (err) {
      setError(err instanceof Error ? err.message : '验证码发送失败');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }

    if (newPassword.length < 8) {
      setError('新密码长度不能少于8位');
      return;
    }

    if (!verificationCode) {
      setError('请输入验证码');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await userService.updatePassword({
        newPassword,
        verificationCode
      });
      toast.success('密码已更新');
      setNewPassword('');
      setConfirmPassword('');
      setVerificationCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '密码更新失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-6">安全设置</h2>

      <div className="max-w-md space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        {/* Verification Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            验证码
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
              placeholder="请输入验证码"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSendCode}
              disabled={countdown > 0 || isSendingCode}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-400 whitespace-nowrap flex items-center space-x-1"
            >
              {isSendingCode && <Loader2 className="w-3 h-3 animate-spin" />}
              <span>
                {countdown > 0 ? `${countdown}s后重新发送` : '发送验证码'}
              </span>
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            新密码
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            确认新密码
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading || !verificationCode || !newPassword || !confirmPassword}
          className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>更新中...</span>
            </>
          ) : (
            <span>更新密码</span>
          )}
        </button>
      </div>
    </div>
  );
};