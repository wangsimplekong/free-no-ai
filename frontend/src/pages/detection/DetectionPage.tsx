import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { DetectionHeader } from './components/DetectionHeader';
import { TextInput } from './components/TextInput';
import { FileUpload } from './components/FileUpload';
import { DetectionResult } from './components/DetectionResult';
import { DetectionHistory } from './components/DetectionHistory';
import { DetectionLoading } from './components/DetectionLoading';
import { detectionService } from '../../services/detection.service';
import { fileDetectionService } from '../../services/file-detection.service';
import { useAuthCheck } from '../../hooks/useAuthCheck';
import { useAuthStore } from '../../stores/auth.store';
import { useDetectionStore } from '../../stores/detection.store';
import { useDetectionPolling } from '../../hooks/useDetectionPolling';
import type { DetectionResponse } from '../../types/detection.types';
import type { QueryDetectionResponse } from '../../types/file-detection.types';
import toast from 'react-hot-toast';

interface LocationState {
  text?: string;
  startDetection?: boolean;
  taskId?: string;
  fileName?: string;
  fromUpload?: boolean;
}

export const DetectionPage: React.FC = () => {
  const location = useLocation();
  const state = location.state as LocationState;
  const { user, updateBenefits } = useAuthStore();
  
  const [text, setText] = useState(state?.text || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<DetectionResponse | null>(null);
  const [fileResult, setFileResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(state?.taskId || null);
  const { checkAuth } = useAuthCheck();

  const { wordCount, setDetectionInfo, reset } = useDetectionStore();

  // Memoize task IDs for polling
  const taskIds = useMemo(() => {
    if (!currentTaskId) return [];
    return [currentTaskId];
  }, [currentTaskId]);

  // Handle polling results callback
  const handlePollingResults = useCallback(async (response: QueryDetectionResponse) => {
    if (!currentTaskId) return;

    const result = response.data.results.find(r => r.taskId === currentTaskId);
    if (!result) return;

    if (result.state === 3) { // Completed
      setFileResult(result);
      setIsProcessing(false);
      setCurrentTaskId(null); // Stop polling
      
      // Update user benefits after successful detection
      try {
        await updateBenefits();
      } catch (error) {
        console.error('Failed to update benefits:', error);
      }
    } else if (result.state === -1) { // Failed
      setError('检测失败，请重试');
      setIsProcessing(false);
      setShowResult(false);
      setCurrentTaskId(null); // Stop polling
      toast.error('检测失败，请重试');
    }
  }, [currentTaskId, updateBenefits]);

  // Use polling hook for file upload detection
  useDetectionPolling(taskIds, handlePollingResults);

  // Handle text detection
  const handleDetection = async () => {
    if (!checkAuth()) return;

    try {
      setIsProcessing(true);
      setShowResult(true);
      setError(null);

      detectionService.validateContent(text);
      const response = await detectionService.detectText(text);
      
      if (response.data) {
        setResult(response.data);
        // Update user benefits after successful text detection
        await updateBenefits();
      } else {
        throw new Error('检测失败，请重试');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '检测失败');
      setShowResult(false);
      toast.error(err instanceof Error ? err.message : '检测失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUploadComplete = async (taskId: string, wordCount: number, fileName: string) => {
    try {
      setIsProcessing(true);
      setShowResult(true);
      setError(null);
      setCurrentTaskId(taskId); // Set current task ID for polling

      setDetectionInfo({
        taskId,
        wordCount,
        fileName
      });

      await fileDetectionService.submitDetection({
        taskId,
        userId: user?.id || '123',
        title: fileName,
        wordCount
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '文件检测失败');
      setShowResult(false);
      setIsProcessing(false);
      setCurrentTaskId(null);
      toast.error('文件检测失败，请重试');
    }
  };

  // Start detection if coming from another page
  useEffect(() => {
    if (state?.startDetection && text) {
      handleDetection();
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      reset();
      setCurrentTaskId(null);
    };
  }, [reset]);

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
          {showResult && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              {isProcessing ? (
                <DetectionLoading />
              ) : (
                result || fileResult ? (
                  <DetectionResult 
                    aiScore={result?.ai_score || fileResult?.similarity || 0}
                    humanScore={result?.human_score || (1 - (fileResult?.similarity || 0))}
                    text={text}
                    reportUrl={fileResult?.zipurl}
                    wordCount={wordCount || text.length}
                  />
                ) : null
              )}
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