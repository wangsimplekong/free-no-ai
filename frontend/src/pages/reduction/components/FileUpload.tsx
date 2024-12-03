import React, { useState } from 'react';
import { Upload, FileText, File } from 'lucide-react';

interface FileUploadProps {
  onUpload: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    onUpload();
  };

  const handleClick = () => {
    onUpload();
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-500'
        }`}
      >
        <div className="flex flex-col items-center">
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-gray-600 mb-2">
            拖拽文件到此处，或
            <button 
              onClick={handleClick}
              className="text-blue-600 hover:text-blue-700 mx-1"
            >
              点击上传
            </button>
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
        </div>
      </div>
      <p className="text-sm text-gray-500">
        支持PDF、Word、TXT格式，单个文件大小不超过10MB
      </p>
    </div>
  );
};