export interface UploadSignatureResponse {
  code: number;
  message: string;
  data: {
    body: {
      ossurl: string;
      ossid: string;
      ossAccessKeyId: string;
      policy: string;
      signature: string;
      ossKey: string;
    }
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

export interface FileDetectionRequest {
  taskId: string;
  userId: string;
  title: string;
  wordCount: number;
}

export interface FileDetectionResponse {
  code: number;
  message: string;
  data: {
    taskId: string;
  };
}

export interface DetectionResult {
  taskId: string;
  state: number;
  similarity: number;
  similarityHigh: number;
  similarityMedium: number;
  similarityLow: number;
  similarityUncheck: number;
  zipurl: string;
  reportTime: string;
}

export interface QueryDetectionRequest {
  taskIds: string[];
}

export interface QueryDetectionResponse {
  code: number;
  message: string;
  data: {
    results: DetectionResult[];
  };
}

export interface FileUploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  taskId: string | null;
}

export interface DetectionHistoryRequest {
  pageNum?: number;
  pageSize?: number;
  startTime?: string;
  endTime?: string;
  status?: number;
}

export interface DetectionHistoryItem {
  taskId: string;
  title: string;
  createTime: string;
  wordCount: number;
  aiProbability: number;
  reportUrl?: string;
  detailUrl?: string;
  status: number;
}

export interface DetectionHistoryResponse {
  code: number;
  message: string;
  data: {
    list: DetectionHistoryItem[];
    total: number;
    pages: number;
    pageNum: number;
    pageSize: number;
  };
}