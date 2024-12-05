import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, File, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fileDetectionService } from '../../services/file-detection.service';
import { useAuthStore } from '../../stores/auth.store';
import { useLoginModal } from '../../hooks/useLoginModal';
import toast from 'react-hot-toast';

const ALLOWED_TYPES = {
  'application/pdf': 'pdf',
  'application/msword': 'word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'word',
  'text/plain': 'txt',
};

const MAX_FILE_SIZE = 31457280; // 30MB

export const FileUploadSection: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { isAuthenticated, updateBenefits } = useAuthStore();
  const { openLoginModal } = useLoginModal();

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
    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    try {
      setIsUploading(true);

      // 1. Get upload signature
      const signature = await fileDetectionService.getUploadSignature();
      const taskId = signature.data.ossid;

      // 2. Upload file to OBS
      const uploadSuccess = await fileDetectionService.uploadToObs(file, signature);
      if (!uploadSuccess) {
        throw new Error('文件上传失败');
      }

      // 3. Parse document
      const parseResult = await fileDetectionService.parseDocument({
        taskId,
        fileType: getFileType(file),
      });

      // 4. Submit detection
      await fileDetectionService.submitDetection({
        taskId,
        userId: '123',
        title: file.name,
        wordCount: parseResult.data.wordCount,
      });

      // 5. Update user benefits after successful detection
      await updateBenefits();

      // 6. Navigate to detection page with taskId
      navigate('/detection', { 
        state: { 
          taskId,
          fileName: file.name,
          fromUpload: true
        }
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '文件上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    await handleUpload(file);
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    await handleUpload(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="flex items-center space-x-4">
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
        className={`relative flex items-center space-x-2 px-4 py-2 border rounded-lg cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:bg-gray-50'
        }`}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-5 w-5 text-gray-500 animate-spin" />
            <span>上传中...</span>
          </>
        ) : (
          <>
            <Upload className="h-5 w-5 text-gray-500" />
            <span>上传文件</span>
            <input
              ref={fileInputRef}
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
          </>
        )}
      </div>
      <p className="text-sm text-gray-500">支持 PDF、Word、TXT，最大30MB</p>
    </div>
  );
};