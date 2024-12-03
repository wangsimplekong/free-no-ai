export enum ReduceTaskStatus {
  WAITING = 0,    // 等待降重(检测未完成)
  PENDING = 1,    // 待降重(检测已完成)
  PROCESSING = 2, // 降重中
  COMPLETED = 3,  // 降重完成
  FAILED = -1     // 降重失败
}

export interface ReduceListRequest {
  userId: string;
  pageNum: number;
  pageSize: number;
  startTime?: string;
  endTime?: string;
  status?: ReduceTaskStatus;
}

export interface ReduceRecord {
  id: string;
  title: string;
  wordCount: number;
  createTime: string;
  status: ReduceTaskStatus;
  detectionId: string;
  detectionStatus: number;
  reduceUrl?: string;
  recheckUrl?: string;
  reduceRate?: number;
  processTime?: number;
  errorMsg?: string;
}

export interface ReduceListResponse {
  total: number;
  pages: number;
  list: ReduceRecord[];
}

export interface ReduceSubmitRequest {
  taskId: string;
  userId: string;
  title: string;
  wordCount: number;
}

export interface ReduceSubmitResponse {
  taskId: string;
}

export interface QueryReduceRequest {
  taskIds: string[];
}

export interface ReduceResult {
  taskId: string;
  state: number;
  reduceUrl?: string;
  recheckUrl?: string;
  reduceRate?: number;
  processTime?: number;
}

export interface QueryReduceResponse {
  results: ReduceResult[];
}