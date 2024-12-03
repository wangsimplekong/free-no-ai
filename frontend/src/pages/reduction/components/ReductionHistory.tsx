import React from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';

export const ReductionHistory: React.FC = () => {
  const history = [
    {
      id: 1,
      title: '毕业论文.docx',
      time: '2024-03-28 15:30:45',
      wordCount: 1234,
      status: 'COMPLETED'
    },
    {
      id: 2,
      title: '研究报告初稿.pdf',
      time: '2024-03-27 10:15:30',
      wordCount: 2156,
      status: 'PROCESSING'
    },
    {
      id: 3,
      title: '项目说明文档.txt',
      time: '2024-03-26 09:45:12',
      wordCount: 567,
      status: 'FAILED'
    }
  ];

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="text-green-600">已完成</span>;
      case 'PROCESSING':
        return <span className="text-blue-600">处理中</span>;
      case 'FAILED':
        return <span className="text-red-600">失败</span>;
      default:
        return <span className="text-gray-600">未知</span>;
    }
  };

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
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="py-4 px-4 text-sm">{item.time}</td>
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
                    <button className="text-gray-500 hover:text-gray-700">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button className="text-gray-500 hover:text-gray-700">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};