import React, { useState } from 'react';
import { ReductionHeader } from './components/ReductionHeader';
import { TextInput } from './components/TextInput';
import { FileUpload } from './components/FileUpload';
import { ReductionResult } from './components/ReductionResult';
import { ReductionHistory } from './components/ReductionHistory';
import { reductionService } from '../../services/reduction.service';
import { useAuthCheck } from '../../hooks/useAuthCheck';

export const ReductionPage: React.FC = () => {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [reducedText, setReducedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { checkAuth } = useAuthCheck();

  const handleReduction = async () => {
    // Check authentication before proceeding
    if (!checkAuth()) return;

    try {
      setIsProcessing(true);
      setError(null);

      // Validate content before sending
      reductionService.validateContent(text);

      // Send reduction request
      const response = await reductionService.reduceText(text);
      
      if (response.data?.text) {
        setReducedText(response.data.text);
        setShowResult(true);
      } else {
        throw new Error('降重处理失败，请稍后重试');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '降重处理失败');
      setShowResult(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = () => {
    // Check authentication before proceeding
    if (!checkAuth()) return;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ReductionHeader />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            <TextInput 
              value={text}
              onChange={setText}
              onReduce={handleReduction}
              isProcessing={isProcessing}
            />
            <div className="mt-4 border-t border-gray-100 pt-4">
              <FileUpload onUpload={handleFileUpload} />
            </div>
          </div>

          {/* Results Section */}
          {showResult && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <ReductionResult 
                originalText={text}
                reducedText={reducedText}
              />
            </div>
          )}

          {/* History Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <ReductionHistory />
          </div>
        </div>
      </main>
    </div>
  );
};