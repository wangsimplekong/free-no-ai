import React from 'react';
import { Loader2 } from 'lucide-react';

export const DetectionLoading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
      <p className="text-gray-600 text-lg">正在检测中，请稍候...</p>
      <p className="text-sm text-gray-500 mt-2">
        检测结果将在几秒钟内生成
      </p>
    </div>
  );
};