import React, { useState } from 'react';
import { Shield, Languages, FileText, RefreshCw, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { useAuthStore } from '../../stores/auth.store';
import { useLoginModal } from '../../hooks/useLoginModal';

export const HomePage = () => {
  const [text, setText] = useState('');
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const { openLoginModal } = useLoginModal();

  const handleDetectionStart = () => {
    if (!text) return;
    
    if (text.length > 2000) {
      return;
    }

    // If not authenticated, show login modal
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    // Navigate to detection page with text as state
    navigate('/detection', { 
      state: { 
        text,
        startDetection: true 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />

      {/* Hero Section */}
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            智能AI检测与降重
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 mb-8">
            AI Detection & Rewriting
          </p>

          {/* Quick Detection Input */}
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6">
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="请输入需要检测的文本内容..."
                className="w-full h-40 p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                maxLength={20000}
              />
              <div className="absolute bottom-4 right-4 text-sm text-gray-500">
                {text.length}/2000字
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Upload className="h-5 w-5 text-gray-500" />
                  <span>上传文件</span>
                </button>
                <p className="text-sm text-gray-500">支持 PDF、Word、TXT</p>
              </div>
              <button
                onClick={handleDetectionStart}
                disabled={!text || text.length > 2000}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed"
              >
                开始检测
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="flex justify-center mb-4">
                <Shield className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold">11个模型</h3>
              <p className="text-gray-600">支持多种检测模型</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="flex justify-center mb-4">
                <Languages className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold">中英双语</h3>
              <p className="text-gray-600">支持中英文检测</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-sm">
              <div className="flex justify-center mb-4">
                <FileText className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold">海量处理</h3>
              <p className="text-gray-600">每日处理文本量</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50" id="detection">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">AIGC检测</h2>
            <p className="mt-4 text-lg text-gray-600">
              支持多种AI模型检测，准确识别AI生成内容
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold mb-4">支持语言</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></span>
                  中文检测与分析
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></span>
                  英文检测与分析
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold mb-4">支持格式</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></span>
                  文本直接输入
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></span>
                  文档批量上传
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Rewrite Section */}
      <div className="py-16" id="rewrite">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">AIGC降重</h2>
            <p className="mt-4 text-lg text-gray-600">
              智能降重服务，保持文章原意的同时提供多种改写方案
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-center mb-4">
                <RefreshCw className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">智能改写</h3>
              <p className="text-gray-600 text-center">
                多种改写方案，灵活选择
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-center mb-4">
                <Languages className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">中英互译</h3>
              <p className="text-gray-600 text-center">
                支持中英文互译降重
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-center mb-4">
                <FileText className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-4">批量处理</h3>
              <p className="text-gray-600 text-center">
                支持文档批量处理
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
                关于我们
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    公司介绍
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    联系我们
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
                服务支持
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    帮助中心
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    API文档
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
                法律条款
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    服务条款
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    隐私政策
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-600 tracking-wider uppercase">
                关注我们
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    微信公众号
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    技术博客
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8 text-center">
            <p className="text-base text-gray-400">
              &copy; 2024 FreenoAI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};