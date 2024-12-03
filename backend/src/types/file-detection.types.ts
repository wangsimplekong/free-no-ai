export enum DetectionTaskStatus {
  PENDING = 0, // 待提交
  SUBMITTED = 1, // 已提交
  PROCESSING = 2, // 检测中
  COMPLETED = 3, // 已完成
  FAILED = -1, // 失败
}

export interface DetectionListRequest {
  userId: string;
  pageNum: number;
  pageSize: number;
  startTime?: string;
  endTime?: string;
  status?: DetectionTaskStatus;
}

export interface DetectionRecord {
  id: string;
  title: string;
  wordCount: number;
  createTime: string;
  status: DetectionTaskStatus;
  similarity: number;
  similarityHigh: number;
  similarityMedium: number;
  similarityLow: number;
  similarityUncheck: number;
  reportUrl: string;
  reportTime: string;
  sourceFileUrl: string;
  sourceFileType: string;
  errorMsg: string;
}

export interface DetectionListResponse {
  total: number;
  pages: number;
  list: DetectionRecord[];
}

export interface DetectionTask {
  id: string;
  userId: string;
  title: string;
  wordCount: number;
  thirdTaskId?: string;
  status: DetectionTaskStatus;
  errorMsg?: string;
  similarity?: number;
  reportUrl?: string;
  sourceFileUrl?: string;
  sourceFileType?: string;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskStatusUpdate {
  status: DetectionTaskStatus;
  similarity?: number;
  similarityHigh?: number;
  similarityMedium?: number;
  similarityLow?: number;
  similarityUncheck?: number;
  reportUrl?: string;
  reportTime?: string;
  updatedAt: Date;
}
