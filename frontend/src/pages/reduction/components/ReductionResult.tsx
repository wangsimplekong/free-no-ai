import React from 'react';
import { Download, Share2 } from 'lucide-react';


interface ReductionResultProps {
  originalText: string;
  reducedText: string;
  reportUrl?: string;
}

export const ReductionResult: React.FC<ReductionResultProps> = ({
  originalText,
  reducedText,
  reportUrl
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">降重结果</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Text */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-medium mb-4">原文</h3>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{originalText}</p>
          </div>
        </div>

        {/* Reduced Text */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-medium mb-4">降重后</h3>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap">{reducedText}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
        <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
          复制结果
        </button>
        <a 
          href={reportUrl}
          download
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Download className="w-4 h-4" />
          <span>下载结果</span>
        </a>
      </div>
    </div>
  );
};