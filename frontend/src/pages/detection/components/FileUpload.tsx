import React, { useState, useCallback } from 'react';
import { Upload, FileText, File, Loader2 } from 'lucide-react';
import { fileDetectionService } from '../../../services/file-detection.service';
import type { FileUploadState } from '../../../types/file-detection.types';

interface FileUploadProps {
  onUploadComplete: (
    taskId: string,
    wordCount: number,
    fileName: string
  ) => void;
}

const ALLOWED_TYPES = {
  'application/pdf': 'pdf',
  'application/msword': 'word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'word',
  'text/plain': 'txt',
};

const MAX_FILE_SIZE = 31457280; // 30MB

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<FileUploadState>({
    uploading: false,
    progress: 0,
    error: null,
    taskId: null,
  });

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

  const handleUpload = async (file: File) => {
    try {
      setUploadState({ ...uploadState, uploading: true, error: null });

      // 1. Get upload signature
      const signature = await fileDetectionService.getUploadSignature();

      // 2. Upload file to OBS
      const uploadSuccess = await fileDetectionService.uploadToObs(
        file,
        signature
      );
      if (!uploadSuccess) {
        throw new Error('文件上传失败');
      }

      // 3. Parse document
      const parseResult = await fileDetectionService.parseDocument({
        taskId: signature.data.ossid,
        fileType: getFileType(file),
      });

      // 4. Notify parent component
      onUploadComplete(
        signature.data.ossid,
        parseResult.data.wordCount,
        file.name
      );

      setUploadState({
        uploading: false,
        progress: 100,
        error: null,
        taskId: signature.data.ossid,
      });
    } catch (error) {
      setUploadState({
        ...uploadState,
        uploading: false,
        error: error instanceof Error ? error.message : '上传失败，请重试',
      });
    }
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (!file) return;

      const error = validateFile(file);
      if (error) {
        setUploadState({ ...uploadState, error });
        return;
      }

      await handleUpload(file);
    },
    [uploadState]
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const error = validateFile(file);
      if (error) {
        setUploadState({ ...uploadState, error });
        return;
      }

      await handleUpload(file);
    },
    [uploadState]
  );

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
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
          {uploadState.uploading ? (
            <>
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
              <p className="text-gray-600">正在上传文件...</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-gray-600 mb-2">
                拖拽文件到此处，或
                <label className="text-blue-600 hover:text-blue-700 mx-1 cursor-pointer">
                  点击上传
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileSelect}
                    disabled={uploadState.uploading}
                  />
                </label>
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

      {uploadState.error && (
        <div className="text-red-500 text-sm text-center">
          {uploadState.error}
        </div>
      )}

      <p className="text-sm text-gray-500">
        支持PDF、Word、TXT格式，单个文件大小不超过30MB
      </p>
    </div>
  );
};
