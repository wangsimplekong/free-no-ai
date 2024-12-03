export interface UploadSignatureResponse {
  ossurl: string;
  ossid: string;
  ossAccessKeyId: string;
  policy: string;
  signature: string;
  ossKey: string;
}

export interface ParseDocRequest {
  taskId: string;
  fileType: 'pdf' | 'word' | 'txt';
}

export interface ParseDocResponse {
  taskId: string;
  wordCount: number;
}

export interface FileDetectionRequest {
  taskId: string;
  userId: string;
  title: string;
  wordCount: number;
}

export interface FileDetectionResponse {
  taskId: string;
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
  results: DetectionResult[];
}