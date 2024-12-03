import React from 'react';
import { CircularProgress } from './CircularProgress';
import { Download, Share2 } from 'lucide-react';

interface DetectionResultProps {
  aiScore: number;
  humanScore: number;
  text: string;
  reportUrl?: string;
}

export const DetectionResult: React.FC<DetectionResultProps> = ({
  aiScore,
  humanScore,
  text,
  reportUrl
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'red';
    if (score >= 0.6) return 'yellow';
    return 'green';
  };

  const formatScore = (score: number) => Math.round(score * 100);
  const formattedAiScore = formatScore(aiScore);
  const formattedHumanScore = formatScore(humanScore);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">检测结果</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Score */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">AI生成概率</h3>
            <CircularProgress 
              value={formattedAiScore} 
              color={getScoreColor(aiScore)}
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">检测时间</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">文本长度</span>
              <span>{text.length}字</span>
            </div>
          </div>
        </div>

        {/* Human Score */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">真人撰写概率</h3>
            <CircularProgress 
              value={formattedHumanScore}
              color={getScoreColor(humanScore)}
            />
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">可信度分析</span>
              <span className={`text-sm ${
                humanScore >= 0.8 ? 'text-green-600' :
                humanScore >= 0.6 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {humanScore >= 0.8 ? '较高' :
                 humanScore >= 0.6 ? '中等' :
                 '较低'}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full">
              <div 
                className={`h-full rounded-full ${
                  humanScore >= 0.8 ? 'bg-green-500' :
                  humanScore >= 0.6 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${formattedHumanScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
          <Share2 className="w-4 h-4" />
          <span>分享结果</span>
        </button>
        {reportUrl ? (
          <a
            href={reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />
            <span>下载报告</span>
          </a>
        ) : (
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
            <Download className="w-4 h-4" />
            <span>下载结果</span>
          </button>
        )}
      </div>
    </div>
  );
};