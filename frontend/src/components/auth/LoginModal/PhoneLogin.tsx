import React, { useState } from 'react';

const PhoneLogin: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);

  const handleSendCode = () => {
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
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <select className="px-3 py-2 bg-gray-50 border-r border-gray-200 text-sm">
            <option value="+86">+86</option>
            <option value="+1">+1</option>
          </select>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="请输入手机号"
            className="flex-1 px-4 py-2 focus:outline-none"
          />
        </div>
      </div>

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
          disabled={countdown > 0 || !phone}
          className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:text-gray-400 whitespace-nowrap"
        >
          {countdown > 0 ? `${countdown}s后重新发送` : '发送验证码'}
        </button>
      </div>

      <button
        disabled={!phone || !code}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
      >
        登录
      </button>
    </div>
  );
};

export default PhoneLogin;