import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DetectionHeader: React.FC = () => {
  return (
    <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-gray-500 hover:text-gray-700">
              <ArrowLeft className="w-5 h-5 mr-2" />
              返回首页
            </Link>
          </div>
          
          <div className="flex items-center">
            <Shield className="w-6 h-6 text-blue-600" />
            <h1 className="ml-2 text-xl font-semibold">AIGC检测</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              剩余字数：<span className="font-medium text-blue-600">1,000</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-sm">
              普通会员
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};