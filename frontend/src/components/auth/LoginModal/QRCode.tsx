import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

const QRCode: React.FC = () => {
  const [isExpired, setIsExpired] = useState(false);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="w-48 h-48 border border-gray-200 rounded-lg flex items-center justify-center">
          {isExpired ? (
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <button 
                onClick={() => setIsExpired(false)}
                className="text-blue-600 hover:text-blue-700"
              >
                点击刷新
              </button>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p>二维码加载中...</p>
            </div>
          )}
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-900">请使用微信扫码登录</p>
        <p className="text-xs text-gray-500 mt-1">扫码后请在手机上确认</p>
      </div>
    </div>
  );
};

export default QRCode;