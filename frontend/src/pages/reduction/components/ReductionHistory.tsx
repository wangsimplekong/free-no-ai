import React, { useEffect, useState } from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { fileReductionService } from '../../../services/file-reduction.service';
import type { ReduceHistoryItem } from '../../../types/file-reduction.types';

export const ReductionHistory: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ReduceHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fileReductionService.getReductionHistory({
        pageNum: currentPage,
        pageSize,
      });
      setHistory(response.data.list);
      setTotal(response.data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取历史记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [currentPage]);

  const getStatusDisplay = (status: number) => {
    switch (status) {
      case 2:
        return <span className="text-green-600">已完成</span>;
      case 1:
        return <span className="text-blue-600">处理中</span>;
      case 3:
        return <span className="text-red-600">失败</span>;
      case 0:
        return <span className="text-yellow-600">等待中</span>;
      default:
        return <span className="text-gray-600">未知</span>;
    }
  };

  const handleDownload = async (url?: string) => {
    if (!url) {
      return;
    }
    try {
      await fileReductionService.downloadReducedFile(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  if (loading && !history.length) {
    return <div className="text-center py-8">加载中...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-8">{error}</div>;
  }

  if (!history.length) {
    return <div className="text-center text-gray-500 py-8">暂无降重历史记录</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">降重历史</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-4 px-4 text-left font-medium text-gray-500">降重时间</th>
              <th className="py-4 px-4 text-left font-medium text-gray-500">文本/文件</th>
              <th className="py-4 px-4 text-left font-medium text-gray-500">字数统计</th>
              <th className="py-4 px-4 text-left font-medium text-gray-500">状态</th>
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
                <td className="py-4 px-4 text-sm">
                  {item.wordCount.toLocaleString()}字
                </td>
                <td className="py-4 px-4 text-sm">
                  {getStatusDisplay(item.status)}
                </td>
                <td className="py-4 px-4">
                  <div className="flex justify-end space-x-3">
                    {item.recheckUrl && (
                      <button 
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => handleDownload(item.recheckUrl)}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    )}
                    {item.reduceUrl && (
                      <button 
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => handleDownload(item.reduceUrl)}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > pageSize && (
        <div className="flex justify-end mt-4 space-x-2">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            上一页
          </button>
          <span className="px-3 py-1">
            第 {currentPage} 页 / 共 {Math.ceil(total / pageSize)} 页
          </span>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage >= Math.ceil(total / pageSize)}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
};