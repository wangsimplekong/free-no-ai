import React, { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { fileDetectionService } from '../../../services/file-detection.service';
import type { DetectionHistoryItem } from '../../../types/file-detection.types';

export const DetectionHistory: React.FC = () => {
  const [history, setHistory] = useState<DetectionHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fileDetectionService.getHistory({
        pageNum: currentPage,
        pageSize,
      });
      
      if (response.code === 200 && response.data) {
        setHistory(response.data.list || []);
      } else {
        throw new Error(response.message || '获取历史记录失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取历史记录失败');
      console.error('Failed to fetch detection history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [currentPage]);

  if (loading) {
    return <div className="text-center py-4">加载中...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-4">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">检测历史</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-4 px-4 text-left font-medium text-gray-500">检测时间</th>
              <th className="py-4 px-4 text-left font-medium text-gray-500">文本/文件</th>
              <th className="py-4 px-4 text-left font-medium text-gray-500">字数统计</th>
              <th className="py-4 px-4 text-left font-medium text-gray-500">AI概率</th>
              <th className="py-4 px-4 text-right font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {history.map((item) => (
              <tr key={item.taskId} className="hover:bg-gray-50">
                <td className="py-4 px-4 text-sm">{item.createTime}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm">{item.title}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm">{item.wordCount}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${item.aiProbability}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm">{item.aiProbability}%</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-right space-x-2">
                  {item.reportUrl && (
                    <a
                      href={item.reportUrl}
                      download
                      className="inline-flex items-center text-gray-500 hover:text-gray-700"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                  {item.detailUrl && (
                    <a
                      href={item.detailUrl}
                      className="inline-flex items-center text-gray-500 hover:text-gray-700"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {history.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          暂无检测历史
        </div>
      )}
    </div>
  );
};