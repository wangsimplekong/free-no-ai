import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, File, Loader2, Download } from 'lucide-react';
import { fileReductionService } from '../../services/file-reduction.service';
import { useAuthStore } from '../../stores/auth.store';
import { useLoginModal } from '../../hooks/useLoginModal';
import type { FileUploadState } from '../../types/file-reduction.types';
import { FileProcessingStatus } from '../../types/file-reduction.types';

interface FileUploadReductionProps {
  onProcessingComplete: (
    reductionTaskId: string,
    reduceUrl: string,
    recheckUrl: string
  ) => void;
  onError: (error: string) => void;
}

const ALLOWED_TYPES = {
  'application/pdf': 'pdf',
  'application/msword': 'word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'word',
  'text/plain': 'txt',
};

const MAX_FILE_SIZE = 31457280; // 30MB

export const FileUploadReduction: React.FC<FileUploadReductionProps> = ({
  onProcessingComplete,
  onError,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<FileProcessingStatus>(
    FileProcessingStatus.IDLE
  );
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [recheckUrl, setRecheckUrl] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<FileUploadState>({
    uploading: false,
    progress: 0,
    error: null,
    taskId: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated, user } = useAuthStore();
  // const { openLoginModal } = useLoginModal();

  const validateFile = (file: File): string | null => {
    if (!Object.keys(ALLOWED_TYPES).includes(file.type)) {
      return '不支持的文件类型，请上传PDF、Word或TXT文件';
    }
    if (file.size > MAX_FILE_SIZE) {
      return '文件大小不能超过30MB';
    }
    return null;
  };

  const getFileType = (file: File): 'pdf' | 'word' | 'txt' => {
    return ALLOWED_TYPES[file.type as keyof typeof ALLOWED_TYPES];
  };

  const processFile = async (file: File) => {
    // if (!isAuthenticated) {
    //   openLoginModal();
    //   return;
    // }

    try {
      // 1. Get upload signature
      setStatus(FileProcessingStatus.UPLOADING);
      const signature = await fileReductionService.getUploadSignature();
      const taskId = signature.data.ossid;

      // 2. Upload file to OBS
      const uploadSuccess = await fileReductionService.uploadToObs(
        file,
        signature
      );
      if (!uploadSuccess) {
        throw new Error('文件上传失败');
      }

      // 3. Parse document
      setStatus(FileProcessingStatus.PARSING);
      const parseResult = await fileReductionService.parseDocument({
        taskId,
        fileType: getFileType(file),
      });

      // 4. Submit detection
      setStatus(FileProcessingStatus.DETECTING);
      const detectionResult = await fileReductionService.submitDetection({
        taskId,
        userId: '123',
        title: file.name,
        wordCount: parseResult.data.wordCount,
      });

      // 5. Submit reduction
      setStatus(FileProcessingStatus.REDUCING);
      const reductionResult = await fileReductionService.submitReduction({
        taskId,
        userId: user?.id || '123',
        title: file.name,
        wordCount: parseResult.data.wordCount,
        detectionId: detectionResult.data.taskId,
      });

      // 6. Poll for results
      const pollInterval = setInterval(async () => {
        const queryResponse = await fileReductionService.queryResults({
          taskIds: [reductionResult.data.taskId],
        });
        console.log(queryResponse.data.results);  
        const result = queryResponse.data.results[0];
        if (result.state === 2) {
          // Completed
          clearInterval(pollInterval);
          setStatus(FileProcessingStatus.COMPLETED);
          if (result.reduceUrl && result.recheckUrl) {
            handleProcessingComplete(
              reductionResult.data.taskId,
              result.reduceUrl,
              result.recheckUrl
            );
          }
        } else if (result.state === -1) {
          // Failed
          clearInterval(pollInterval);
          setStatus(FileProcessingStatus.FAILED);
          throw new Error('降重处理失败');
        }
      }, 3000);

      // Clear interval after 5 minutes (timeout)
      setTimeout(() => {
        clearInterval(pollInterval);
        if (status !== FileProcessingStatus.COMPLETED) {
          setStatus(FileProcessingStatus.FAILED);
          onError('处理超时，请重试');
        }
      }, 60 * 60 * 1000);
    } catch (error) {
      setStatus(FileProcessingStatus.FAILED);
      onError(error instanceof Error ? error.message : '文件处理失败');
    }
  };

  const handleProcessingComplete = useCallback(
    async (reductionTaskId: string, reduceUrl: string, recheckUrl: string) => {
      try {
        setDownloadUrl(reduceUrl);
        setRecheckUrl(recheckUrl);
        onProcessingComplete(reductionTaskId, reduceUrl, recheckUrl);
      } catch (error) {
        console.error('Error setting download URL:', error);
        onError('准备下载时出错，请稍后重试');
      }
    },
    [onProcessingComplete, onError]
  );

  const handleDownload = useCallback(async () => {
    if (!downloadUrl) {
      onError('下载链接不可用');
      return;
    }
    try {
      await fileReductionService.downloadReducedFile(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      onError('下载文件时出错，请稍后重试');
    }
  }, [downloadUrl, onError]);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      // if (!isAuthenticated) {
      //   openLoginModal();
      //   return;
      // }

      const file = e.dataTransfer.files[0];
      if (!file) return;

      const error = validateFile(file);
      if (error) {
        onError(error);
        return;
      }

      await processFile(file);
    }
    // [isAuthenticated]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      // if (!isAuthenticated) {
      //   openLoginModal();
      //   return;
      // }

      const file = e.target.files?.[0];
      if (!file) return;

      const error = validateFile(file);
      if (error) {
        onError(error);
        return;
      }

      await processFile(file);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
    // [isAuthenticated]
  );

  const handleUploadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // if (!isAuthenticated) {
    //   openLoginModal();
    //   return;
    // }
    fileInputRef.current?.click();
  };

  const getStatusDisplay = () => {
    switch (status) {
      case FileProcessingStatus.UPLOADING:
        return '正在上传文件...';
      case FileProcessingStatus.PARSING:
        return '正在解析文档...';
      case FileProcessingStatus.DETECTING:
        return '正在检测文本...';
      case FileProcessingStatus.REDUCING:
        return '正在降重处理...';
      case FileProcessingStatus.COMPLETED:
        return '处理完成';
      case FileProcessingStatus.FAILED:
        return '处理失败';
      default:
        return '拖拽文件到此处，或点击上传';
    }
  };

  const isProcessing =
    status !== FileProcessingStatus.IDLE &&
    status !== FileProcessingStatus.COMPLETED &&
    status !== FileProcessingStatus.FAILED;

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          // if (!isAuthenticated) {
          //   openLoginModal();
          //   return;
          // }
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-blue-500'
        }`}
      >
        <div className="flex flex-col items-center">
          {isProcessing ? (
            <>
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
              <p className="text-gray-600">{getStatusDisplay()}</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-gray-600 mb-2">
                拖拽文件到此处，或
                <button
                  onClick={handleUploadClick}
                  className="text-blue-600 hover:text-blue-700 mx-1"
                >
                  点击上传
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileSelect}
                  disabled={isProcessing}
                />
              </p>
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-500">PDF</span>
                </div>
                <div className="flex items-center">
                  <File className="w-5 h-5 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-500">Word</span>
                </div>
                <div className="flex items-center">
                  <File className="w-5 h-5 text-gray-400 mr-1" />
                  <span className="text-sm text-gray-500">TXT</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-500">
        支持PDF、Word、TXT格式，单个文件大小不超过30MB
      </p>
      {status === FileProcessingStatus.COMPLETED && (
        <button
          onClick={handleDownload}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          下载文件
        </button>
      )}
    </div>
  );
};

export default FileUploadReduction;
