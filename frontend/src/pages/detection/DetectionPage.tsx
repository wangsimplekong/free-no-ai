import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DetectionHeader } from './components/DetectionHeader';
import { TextInput } from './components/TextInput';
import { FileUpload } from './components/FileUpload';
import { DetectionResult } from './components/DetectionResult';
import { DetectionHistory } from './components/DetectionHistory';
import { detectionService } from '../../services/detection.service';
import { fileDetectionService } from '../../services/file-detection.service';
import { useAuthCheck } from '../../hooks/useAuthCheck';
import type { DetectionResponse } from '../../types/detection.types';
import type { DetectionResult as FileDetectionResult } from '../../types/file-detection.types';

interface LocationState {
  text?: string;
  startDetection?: boolean;
}

export const DetectionPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState;
  
  const [text, setText] = useState(state?.text || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<DetectionResponse | null>(null);
  const [fileResult, setFileResult] = useState<FileDetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { checkAuth } = useAuthCheck();

  useEffect(() => {
    if (state?.startDetection && text) {
      handleDetection();
    }
  }, []);

  const handleDetection = async () => {
    // Check authentication before proceeding
    if (!checkAuth()) return;

    try {
      setIsProcessing(true);
      setError(null);

      // Validate content before sending
      detectionService.validateContent(text);

      // Send detection request
      const response = await detectionService.detectText(text);
      
      if (response.data) {
        setResult(response.data);
        setShowResult(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Detection failed');
      setShowResult(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUploadComplete = async (taskId: string, wordCount: number, fileName: string) => {
    try {
      setIsProcessing(true);
      setError(null);

      // Submit file detection task
      const response = await fileDetectionService.submitDetection({
        taskId,
        userId: 'current-user-id', // Replace with actual user ID
        title: fileName,
        wordCount
      });

      // Start polling for results
      const pollInterval = setInterval(async () => {
        const queryResponse = await fileDetectionService.queryResults({
          taskIds: [response.data.taskId]
        });

        const result = queryResponse.data.results[0];
        if (result.state === 3) { // Completed
          clearInterval(pollInterval);
          setFileResult(result);
          setShowResult(true);
        } else if (result.state === -1) { // Failed
          clearInterval(pollInterval);
          setError('文件检测失败，请重试');
        }
      }, 3000);

      // Clear interval after 5 minutes (timeout)
      setTimeout(() => {
        clearInterval(pollInterval);
        if (!fileResult) {
          setError('检测超时，请重试');
        }
      }, 5 * 60 * 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : '文件检测失败');
      setShowResult(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DetectionHeader />
      
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
              onDetect={handleDetection}
              isProcessing={isProcessing}
            />
            <div className="mt-4 border-t border-gray-100 pt-4">
              <FileUpload onUploadComplete={handleFileUploadComplete} />
            </div>
          </div>

          {/* Results Section */}
          {showResult && (result || fileResult) && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <DetectionResult 
                aiScore={result?.ai_score || fileResult?.similarity || 0}
                humanScore={result?.human_score || (1 - (fileResult?.similarity || 0))}
                text={text}
                reportUrl={fileResult?.zipurl}
              />
            </div>
          )}

          {/* History Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <DetectionHistory />
          </div>
        </div>
      </main>
    </div>
  );
};