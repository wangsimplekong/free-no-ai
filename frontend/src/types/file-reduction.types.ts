export interface UploadSignatureResponse {
  code: number;
  message: string;
  data: {
    ossurl: string;
    ossid: string;
    ossAccessKeyId: string;
    policy: string;
    signature: string;
    ossKey: string;
  };
}

export interface ParseDocRequest {
  taskId: string;
  fileType: 'pdf' | 'word' | 'txt';
}

export interface ParseDocResponse {
  code: number;
  message: string;
  data: {
    taskId: string;
    wordCount: number;
  };
}

export interface DetectionRequest {
  taskId: string;
  userId: string;
  title: string;
  wordCount: number;
}

export interface DetectionResponse {
  code: number;
  message: string;
  data: {
    taskId: string;
  };
}

export interface FileReductionRequest {
  taskId: string;
  userId: string;
  title: string;
  wordCount: number;
  detectionId: string;
}

export interface FileReductionResponse {
  code: number;
  message: string;
  data: {
    taskId: string;
  };
}

export interface ReductionResult {
  taskId: string;
  state: number;
  reduceUrl?: string;
  recheckUrl?: string;
  reduceRate?: number;
  processTime?: number;
}

export interface QueryReductionRequest {
  taskIds: string[];
}

export interface QueryReductionResponse {
  code: number;
  message: string;
  data: {
    results: ReductionResult[];
  };
}

export interface FileUploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  taskId: string | null;
}

export enum FileProcessingStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  PARSING = 'PARSING',
  DETECTING = 'DETECTING',
  REDUCING = 'REDUCING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}