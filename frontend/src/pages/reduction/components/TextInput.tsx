import React from 'react';
import { RefreshCw } from 'lucide-react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onReduce: () => void;
  isProcessing: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  onReduce,
  isProcessing
}) => {
  const maxLength = 5000;

  return (
    <div className="space-y-4">
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="请输入需要降重的文本内容..."
          className="w-full h-48 p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          maxLength={maxLength}
          disabled={isProcessing}
        />
        <div className="absolute bottom-4 right-4 text-sm">
          <span className={value.length > maxLength ? 'text-red-500' : 'text-gray-500'}>
            {value.length}
          </span>
          <span className="text-gray-500">/{maxLength}字</span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          支持中英文降重，最多{maxLength}字
        </div>
        <button
          onClick={onReduce}
          disabled={!value || isProcessing}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center space-x-2"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>降重中...</span>
            </>
          ) : (
            <span>开始降重</span>
          )}
        </button>
      </div>
    </div>
  );
};