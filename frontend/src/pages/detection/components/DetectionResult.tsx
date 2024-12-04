import React from 'react';
import { Download } from 'lucide-react';

interface DetectionResultProps {
  aiScore: number;
  humanScore: number;
  text: string;
  reportUrl?: string;
  wordCount: number;
}

export const DetectionResult: React.FC<DetectionResultProps> = ({
  aiScore,
  humanScore,
  text,
  reportUrl,
  wordCount
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
            <div className={`relative inline-flex items-center justify-center`}>
              <svg className="transform -rotate-90 w-20 h-20">
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 30}
                  strokeDashoffset={2 * Math.PI * 30 * (1 - aiScore)}
                  className={`${
                    getScoreColor(aiScore) === 'red'
                      ? 'text-red-500'
                      : getScoreColor(aiScore) === 'yellow'
                      ? 'text-yellow-500'
                      : 'text-green-500'
                  } transition-all duration-1000 ease-out`}
                />
              </svg>
              <span className={`absolute text-xl font-semibold ${
                getScoreColor(aiScore) === 'red'
                  ? 'text-red-500'
                  : getScoreColor(aiScore) === 'yellow'
                  ? 'text-yellow-500'
                  : 'text-green-500'
              }`}>
                {formattedAiScore}%
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">检测时间</span>
              <span>{new Date().toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">文本长度</span>
              <span>{wordCount}字</span>
            </div>
          </div>
        </div>

        {/* Human Score */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">真人撰写概率</h3>
            <div className="relative inline-flex items-center justify-center">
              <svg className="transform -rotate-90 w-20 h-20">
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="30"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 30}
                  strokeDashoffset={2 * Math.PI * 30 * (1 - humanScore)}
                  className={`${
                    getScoreColor(humanScore) === 'red'
                      ? 'text-red-500'
                      : getScoreColor(humanScore) === 'yellow'
                      ? 'text-yellow-500'
                      : 'text-green-500'
                  } transition-all duration-1000 ease-out`}
                />
              </svg>
              <span className={`absolute text-xl font-semibold ${
                getScoreColor(humanScore) === 'red'
                  ? 'text-red-500'
                  : getScoreColor(humanScore) === 'yellow'
                  ? 'text-yellow-500'
                  : 'text-green-500'
              }`}>
                {formattedHumanScore}%
              </span>
            </div>
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
      <div className="flex justify-end pt-4 border-t border-gray-100">
        {reportUrl && (
          <a
            href={reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>下载报告</span>
          </a>
        )}
      </div>
    </div>
  );
};